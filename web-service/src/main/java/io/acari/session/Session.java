package io.acari.session;

import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandKey;
import com.netflix.hystrix.HystrixCommandProperties;
import com.netflix.hystrix.HystrixObservableCommand;
import io.acari.stream.util.Throttle;
import io.acari.stream.util.TroubleMaker;

import static io.acari.pojo.Translator.calculateRequestsPerSecond;

public class Session {
    private final Long id;
    private final TroubleMaker troubleMaker;
    private final Throttle throttle;
    private final HystrixObservableCommand.Setter commandSetter;
    private final HystrixObservableCommand.Setter sinkCommandSetter;

    public Session(Long id, TroubleMaker troubleMaker, Throttle throttle) {
        this.id = id;
        this.troubleMaker = troubleMaker;
        this.throttle = throttle;
        this.commandSetter =
                HystrixObservableCommand.Setter
                        .withGroupKey(HystrixCommandGroupKey.Factory.asKey("CommandGroup"))
                .andCommandKey(HystrixCommandKey.Factory.asKey(id +"msgFactory"));
        this.sinkCommandSetter =
                HystrixObservableCommand.Setter
                        .withGroupKey(HystrixCommandGroupKey.Factory.asKey("SinkGroup"))
                .andCommandKey(HystrixCommandKey.Factory.asKey(id + "sendMsg"));
    }

    public Long getId() {
        return id;
    }

    public TroubleMaker getTroubleMaker() {
        return troubleMaker;
    }

    public Throttle getThrottle() {
        return throttle;
    }

    public HystrixObservableCommand.Setter getCommandSetter(){
        return commandSetter;
    }

    public HystrixObservableCommand.Setter getSinkCommandSetter() {
        return sinkCommandSetter;
    }

    public int getRequestsPerSecond() {
        return calculateRequestsPerSecond(getThrottle().getSleepyTime());
    }

    public boolean getMessageFactoryLiveness() {
        return getTroubleMaker().getLiveness();
    }

    public int getMessageFactoryLatency() {
        return getTroubleMaker().getDelay();
    }
}
