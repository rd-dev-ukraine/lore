import * as angular from "angular";

export type ClosePopupFunction = () => void;

export class PopupService {
    static Name = "PopupService";
    static $inject = ["$compile"];

    constructor(private $compile: angular.ICompileService) {
    }

    open(popupContentTemplate: string): ($scope: angular.IScope) => ClosePopupFunction {
        const content = `
                <div class="popup-overlay">
                    ${popupContentTemplate}
                </div>
                `;

        return ($scope: angular.IScope) => {
            const element = this.$compile(content)($scope);
            const body = document.body;

            const popupElement = body.appendChild(element[0]);

            return () => {
                body.removeChild(popupElement);
            };
        };
    }
}