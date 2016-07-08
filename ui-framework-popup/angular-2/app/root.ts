import { Component  } from "angular2/core";

import { OverlayService, OverlayComponent, OverlayHostComponent } from "./overlay";
import { TestPopup } from "./test-popup.component";

@Component({
    directives: [OverlayHostComponent, TestPopup],
    providers: [OverlayService],
    selector: "root",
    template: `
    <h1>
        Hello, Angular 2
    </h1>
    <div>
        <test-popup></test-popup>
    </div>
    <overlay-host></overlay-host>
    `
})
export class Root {
}