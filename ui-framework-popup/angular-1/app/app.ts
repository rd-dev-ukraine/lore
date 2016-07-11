import * as angular from "angular";

import { config as TestPopupComponent } from "./test-popup.component";
import { config as PopupContentComponent } from "./popup-content.component";
import * as PopupDirective from "./popup.directive";
import { PopupService } from "./popup.service";

angular.module("app", [])
    .service(PopupService.Name, PopupService)
    .directive(PopupDirective.name, () => PopupDirective.configuration)
    .component("testPopup", TestPopupComponent)
    .component("popupContent", PopupContentComponent);