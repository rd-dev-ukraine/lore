import * as angular from "angular";

import { PopupService } from "./popup.service";

export class TestPopupComponentController {

    static $inject = ["$scope", PopupService.Name];

    text: string = "Open popup with this text";

    constructor(
        private $scope: angular.IScope,
        private popupService: PopupService) {
    }

    openPopup() {
        const template = `<popup-content text="$c.text" close="$c.closePopup()" ></popup-content>`;
        this.popupService.open(template)(this.$scope);
    }

    closePopup() {
        this.$scope["closePopup"]();
    }
}

export const config: angular.IComponentOptions = {
    controller: TestPopupComponentController,
    controllerAs: "$c",
    template: `
    <div>
        <div class="form-group">
            <label>
                Enter text to display in popup:
            </label>
            <input class="form-control" ng-model="$c.text" type="text" />
        </div>
        <p>
            <button class="btn btn-primary" 
                    ng-click="$c.openPopup()">
                Open popup
            </button>
        </p>
    </div>
    `
};