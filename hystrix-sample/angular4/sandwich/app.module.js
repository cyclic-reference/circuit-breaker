"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var app_component_1 = require("./app.component");
var http_1 = require("@angular/http");
var host_service_1 = require("./host.service");
var session_service_1 = require("./session.service");
var message_component_1 = require("./message.component");
var message_service_1 = require("./message.service");
var window_1 = require("./window");
var slider_component_1 = require("./slider.component");
var ng2_nouislider_1 = require("ng2-nouislider");
var angular2_ui_switch_1 = require("angular2-ui-switch");
var switch_component_1 = require("./switch.component");
var latency_component_1 = require("./latency.component");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [
            platform_browser_1.BrowserModule,
            forms_1.FormsModule,
            http_1.HttpModule,
            ng2_nouislider_1.NouisliderModule,
            angular2_ui_switch_1.UiSwitchModule
        ],
        declarations: [
            app_component_1.AppComponent,
            message_component_1.MessageComponent,
            slider_component_1.SliderCompontent,
            switch_component_1.SwitchComponent,
            latency_component_1.LatencyCompontent
        ],
        bootstrap: [app_component_1.AppComponent],
        providers: [host_service_1.HostService, session_service_1.SessionService, message_service_1.MessageService, window_1.WindowRef]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map