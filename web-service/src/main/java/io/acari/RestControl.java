package io.acari;

import io.acari.pojo.LatencyParameters;
import io.acari.pojo.LivenessParameters;
import io.acari.pojo.ThrottleParameters;
import io.acari.session.SessionManager;
import io.acari.session.SessionRepository;
import io.acari.stream.util.StreamSource;
import io.acari.stream.util.Throttle;
import io.acari.stream.util.TroubleMaker;
import io.acari.util.ChainableOptional;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import rx.Observable;

import java.io.IOException;
import java.time.Instant;

import static io.acari.HystrixCommandBean.FALL_BACK;
import static io.acari.pojo.Translator.calculateTimeToWait;

@RestController
@RequestMapping("/hystrix")
public class RestControl {
    private static final Log log = LogFactory.getLog(RestControl.class);
    private final SessionManager sessionManager;
    private SessionRepository sessionRepository;

    @Autowired
    public RestControl(SessionRepository sessionRepository,
                       SessionManager sessionManager) {
        this.sessionRepository = sessionRepository;
        this.sessionManager = sessionManager;
    }

    @RequestMapping("/get/stream-id")
    public Long streamId() {
        return sessionManager.fetchUnusedSession().getId();
    }

    @RequestMapping("/get/{sessionId}/throttle")
    public ResponseEntity<ThrottleParameters> getThrottleParameters(@PathVariable Long sessionId) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(ThrottleParameters::new));

    }

    @RequestMapping(value = "/post/{sessionId}/throttle", method = RequestMethod.POST)
    public ResponseEntity<ThrottleParameters> getThrottleParameters(@PathVariable Long sessionId, @RequestBody ThrottleParameters throttleParameters) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(session -> {
                    int sleepyTimeInMilliseconds = calculateTimeToWait(throttleParameters.getRequestsPerSecond());
                    session.getThrottle().setSleepyTime(sleepyTimeInMilliseconds);
                    return session;
                })
                .map(ThrottleParameters::new));

    }

    @RequestMapping("/get/{sessionId}/latency")
    public ResponseEntity<LatencyParameters> getLatencyParameters(@PathVariable Long sessionId) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(LatencyParameters::new));
    }

    @RequestMapping(value = "/post/{sessionId}/latency", method = RequestMethod.POST)
    public ResponseEntity<LatencyParameters> getLatencyParameters(@PathVariable Long sessionId, @RequestBody LatencyParameters latencyParameters) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(session -> {
                    session.getTroubleMaker().setDelay(latencyParameters);
                    return session;
                })
                .map(LatencyParameters::new));
    }

    @RequestMapping("/get/{sessionId}/liveness")
    public ResponseEntity<LivenessParameters> getLiveness(@PathVariable Long sessionId) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(LivenessParameters::new));
    }

    @RequestMapping("/post/{sessionId}/liveness")
    public ResponseEntity<LivenessParameters> getLiveness(@PathVariable Long sessionId, @RequestBody LivenessParameters livenessParameters) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(session -> {
                    session.getTroubleMaker().setLiveness(livenessParameters);
                    return session;
                })
                .map(LivenessParameters::new));

    }

    private <T> ResponseEntity<T> respondWith(Observable<T> observable) {
        return observable.map(ResponseEntity::ok)
                .defaultIfEmpty(this.notFound())
                .toBlocking()
                .first();
    }

    private <T> ResponseEntity<T> notFound() {
        return ResponseEntity.<T>notFound().build();
    }

    @RequestMapping("/{sessionId}/message.stream")
    public ResponseEntity<SseEmitter> testo(@PathVariable Long sessionId) {
        return respondWith(sessionRepository.getSession(sessionId)
                .map(session -> {
                    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
                    TroubleMaker troubleMaker = session.getTroubleMaker();
                    Throttle iCantDive55 = session.getThrottle();
                    StreamSource.stream
                            .map(iCantDive55::whoaDoggy)
                            .flatMap(aLong -> new HystrixCommandBean(session.getCommandSetter(), aLong, troubleMaker::getMessage)
                                    .observe()
                                    .map(result -> "Message " + aLong + " " + (result == FALL_BACK ? "Failed. ☹️" : "Succeeded. ☺️")))
                            .flatMap(message ->
                                    new MessageSinkBean(session.getSinkCommandSetter(), message)
                                            .observe())
                            .subscribe(aLong -> {
                                try {
                                    emitter.send(aLong + " @ " + Instant.now());
                                } catch (IOException | IllegalStateException e) {
                                    log.info("Issue sending message for session " + sessionId + " " + e.getMessage());
                                    throw new IllegalStateException("Listener stopped listening");
                                }
                            }, e -> {
                                ChainableOptional
                                        .ofNullable(e)
                                        .filter(t -> !(t instanceof IllegalStateException))
                                        .ifPresent(t -> log.error("An error occurred when sending messages.", t));
                                sessionManager.discardSession(session);
                                emitter.complete();
                            }, () -> {
                                try {
                                    emitter.send("Stream Complete.");
                                } catch (IOException | IllegalStateException ignored) {
                                } finally {
                                    emitter.complete();
                                    sessionManager.discardSession(session);
                                }
                            });
                    return emitter;
                }));
    }
}
