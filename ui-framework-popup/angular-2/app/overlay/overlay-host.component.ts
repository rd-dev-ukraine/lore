import { Component, ComponentRef, ComponentResolver, OnInit, Type, ViewChild, ViewContainerRef } from "angular2/core";

import { OverlayComponent } from "./overlay.component";
import { IOverlayHost, OverlayService } from "./overlay.service";

@Component({
    selector: "overlay-host",
    template: "<template #container></template>"
})
export class OverlayHostComponent implements IOverlayHost, OnInit {

    @ViewChild("container", { read: ViewContainerRef }) container: ViewContainerRef;

    constructor(
        private overlayService: OverlayService,
        private componentResolver: ComponentResolver) {
    }

    openComponentInPopup<T>(componentType: Type): Promise<ComponentRef> {
        return this.componentResolver
            .resolveComponent(OverlayComponent)
            .then(factory => this.container.createComponent(factory))
            .then((overlayRef: ComponentRef) => {

                return overlayRef.instance
                    .addComponent(componentType)
                    .then(result => {

                        result.onDestroy(() => {
                            overlayRef.destroy();
                        });

                        const overlay = overlayRef.location.nativeElement;
                        return result;
                    });
            });
    }

    ngOnInit(): void {
        this.overlayService.registerHost(this);
    }
}
