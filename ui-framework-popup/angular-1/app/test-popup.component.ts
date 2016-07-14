import * as angular from "angular";

import { PopupService } from "./popup.service";

export class TestPopupComponentController {

    static $inject = ["$scope", PopupService.Name];

    private popupVisible = false;

    text: string = "Open popup with this text";
    closePopupFn: () => void;

    constructor(
        private $scope: angular.IScope,
        private popupService: PopupService) {
    }

    openPopup() {
        const template = `<popup-content text="$c.text" close="$c.closePopup()" ></popup-content>`;
        this.closePopupFn = this.popupService.open(template)(this.$scope);
    }

    closePopup() {
        if (this.closePopupFn) {
            this.closePopupFn();
            this.closePopupFn = null;
        }
    }

    openInlinePopup() {
        this.popupVisible = true;
    }

    closeInlinePopup() {
        this.popupVisible = false;
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
            <button class="btn btn-default" 
                    ng-click="$c.openInlinePopup()">
                Open inline 
            </button>
        </p>
        <popup ng-if="$c.popupVisible">
            <popup-content text="$c.text" close="$c.closeInlinePopup()">
            </popup-content>
        </popup>
    </div>
    `
};