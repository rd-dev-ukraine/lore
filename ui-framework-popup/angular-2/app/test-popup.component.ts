import { Component, Input } from "angular2/core";

import { OverlayService } from "./overlay";
import { PopupContent } from "./popup-content.component";

@Component({
    selector: "test-popup",
    template: `
    <div>
        <div class="form-group">
            <label>
                Enter text to display in popup:
            </label>
            <input class="form-control" [(ngModel)]="text" type="text" />
        </div>
        <p>
            <button class="btn btn-primary" 
                    (click)="openPopup()">
                Open popup
            </button>
        </p>                
    </div>    
    `
})
export class TestPopup {
    text: string = "Show me in popup";

    constructor(private overlayService: OverlayService) {
    }

    openPopup() {
        this.overlayService
            .openComponentInPopup(PopupContent)
            .then(c => {
                const popup: PopupContent = c.instance;
                popup.text = this.text;
                popup.close.subscribe(n => {
                    c.destroy();
                });
            });
    }
}