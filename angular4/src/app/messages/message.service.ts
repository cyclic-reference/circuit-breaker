/// <reference path="../util/EventSource.d.ts"/>
import {Injectable} from '@angular/core';
import {SessionService} from '../session/session.service';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/operator/mergeMap';
import {Message} from './message';

@Injectable()
export class MessageService {
    constructor(private sessionService: SessionService) {
    }

    fetchMessages(): Observable<Message> {
        return this.sessionService.fetchSessionId()
            .flatMap(sessionId => {
                return Observable.create((observer: Observer<Message>) => {
                    let eventSource = new EventSource( './hystrix/' + sessionId + '/message.stream');
                    eventSource.onmessage = x => {
                        observer.next(new Message(x.data));
                    };
                    eventSource.onerror = x => observer.error(console.log('EventSource failed ' + x));
                    return () => {
                    };
                });
            });
    }
}
