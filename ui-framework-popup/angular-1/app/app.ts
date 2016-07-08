import * as angular from "angular";

import { config as TestPopupComponent } from "./test-popup.component";

angular.module("app", [])
    .component("testPopup", TestPopupComponent);