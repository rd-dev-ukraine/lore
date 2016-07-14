import { AfterViewInit, Component, ComponentRef, ComponentResolver, ElementRef, Renderer, Type, ViewChild, ViewContainerRef } from "angular2/core";


@Component({
    selector: "overlay",
    template: "<template #container></template>",
    styles: [
        `
        :host {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;

            background: rgba(100, 100, 100, 0.6);

            display: flex;
            flex-flow: row nowrap;
            justify-content: center;
            align-items: center;
        }
    `]
})
export class OverlayComponent implements AfterViewInit {
    private completeComponentCreation: () => void;

    @ViewChild("container", { read: ViewContainerRef }) container: ViewContainerRef;

    constructor(
        private componentResolver: ComponentResolver,
        private elementRef: ElementRef,
        private renderer: Renderer) {
    }

    addComponent<T>(componentType: Type): Promise<ComponentRef> {
        return new Promise(resolve => {

            this.completeComponentCreation = () => {

                this.componentResolver
                    .resolveComponent(componentType)
                    .then(factory => this.container.createComponent(factory))
                    .then(c => {

                        resolve(c);
                    });
            };
        });
    }

    ngAfterViewInit(): void {
        if (this.completeComponentCreation) {
            this.completeComponentCreation();
        }
    }
}
