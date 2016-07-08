import { Component, EventEmitter, Input, Output } from "angular2/core";

@Component({
    selector: "popup-content",
    template: `
        <div class="alert alert-success">
            <h2>
                {{ text }}
            </h2>
            <button class="btn btn-warning"
                    (click)="close.emit($event)" 
                    type="button" >
                Close popup
            </button>
        </div>
    `
})
export class PopupContent {
    @Input() text: string;
    @Output() close: EventEmitter<any> = new EventEmitter<any>();
}