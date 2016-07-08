import * as angular from "angular";

export class PopupContentComponentController {
    text: string;
    close() { }
}

export const config: angular.IComponentOptions = {
    bindings: {
        text: "=",
        close: "&"
    },
    controller: PopupContentComponentController,
    controllerAs: "$c",
    template: `
    <div class="alert alert-success">
            <h2>
                {{ $c.text }}
            </h2>
            <button class="btn btn-warning"
                    ng-click="$c.close()" 
                    type="button" >
                Close popup
            </button>
        </div>
    `
};