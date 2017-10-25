package io.acari.pojo;

import io.acari.session.Session;

import static io.acari.pojo.Translator.*;

public class ThrottleParameters extends SessionParameters {
    private int requestsPerSecond;

    public ThrottleParameters() {
    }

    public ThrottleParameters(Session session) {
        super(session);
        setRequestsPerSecond(calculateRequestsPerSecond(session.getThrottle().getSleepyTime()));
    }

    public int getRequestsPerSecond() {
        return requestsPerSecond;
    }

    public void setRequestsPerSecond(int requestsPerSecond) {
        this.requestsPerSecond = requestsPerSecond;
    }
}