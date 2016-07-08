import * as angular from "angular";

import { config as TestPopupComponent } from "./test-popup.component";
import { config as PopupContentComponent } from "./popup-content.component";
import { PopupService } from "./popup.service";

angular.module("app", [])
    .service(PopupService.Name, PopupService)
    .component("testPopup", TestPopupComponent)
    .component("popupContent", PopupContentComponent);