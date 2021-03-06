/**
 * Created by alex on 6/7/17.
 */
import {Component, NgZone, OnInit} from '@angular/core';
import './switch.component.htm';
import {Http} from '@angular/http';
import {SessionService} from '../session/session.service';


@Component({
    selector: 'dead-mans-switch',
    template: require('./switch.component.htm'),
    styleUrls: []
})
export class SwitchComponent implements OnInit {
    liveness: Boolean = true;

    ngOnInit(): void {
        let httpo = this.http;
        let self = this;
        let zono = self.zone;
        this.sessionService.fetchSessionId()
            .subscribe(function (sessionId) {
                httpo.get('./hystrix/get/' + sessionId + '/liveness')
                    .subscribe(response => {
                        zono.run(() => self.liveness = response.json().serviceAlive);
                    });
            });
    }


    constructor(private sessionService: SessionService, private http: Http, private zone: NgZone) {
    }

    change(value: any): void {
        let httpo = this.http;
        let self = this;
        let zono = self.zone;
        this.sessionService.fetchSessionId()
            .subscribe(function (sessionId) {
                httpo.post('./hystrix/post/' + sessionId + '/liveness',
                    {serviceAlive: value, sessionId: sessionId})
                    .subscribe(response => {
                        zono.run(() => self.liveness = response.json().serviceAlive);
                    });
            });
    }
}
