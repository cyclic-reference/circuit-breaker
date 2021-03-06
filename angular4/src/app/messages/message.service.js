"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../util/EventSource.d.ts"/>
var core_1 = require("@angular/core");
var session_service_1 = require("../session/session.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/mergeMap");
var message_1 = require("./message");
var MessageService = /** @class */ (function () {
    function MessageService(sessionService) {
        this.sessionService = sessionService;
    }
    MessageService.prototype.fetchMessages = function () {
        return this.sessionService.fetchSessionId()
            .flatMap(function (sessionId) {
            return Observable_1.Observable.create(function (observer) {
                var eventSource = new EventSource('./hystrix/' + sessionId + '/message.stream');
                eventSource.onmessage = function (x) {
                    observer.next(new message_1.Message(x.data));
                };
                eventSource.onerror = function (x) { return observer.error(console.log('EventSource failed ' + x)); };
                return function () {
                };
            });
        });
    };
    MessageService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [session_service_1.SessionService])
    ], MessageService);
    return MessageService;
}());
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map