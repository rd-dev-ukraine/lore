import { ComponentRef, ElementRef, Injectable, Type } from "angular2/core";


export interface IOverlayHost {
    openComponentInPopup<T>(componentType: Type): Promise<ComponentRef>;
}


/** Adds components in overlay to the HTML tree at position specified by `overlay-host` component. */
@Injectable()
export class OverlayService {
    private host: IOverlayHost;

    registerHost(hostComponent: IOverlayHost): void {
        this.host = hostComponent;
    }

    openComponentInPopup<T>(componentType: Type): Promise<ComponentRef> {
        if (!this.host) {
            throw new Error("Host is not registered");
        }

        return this.host.openComponentInPopup(componentType);
    }
}
