import * as React from "react";
import * as ReactDOM from "react-dom";

export class IfComponent extends React.Component<{ condition: () => boolean }, {}> {
    constructor() {
        super();
    }

    render() {
        if (this.props.condition && this.props.condition()) {
            return (
                <div>
                    { this.props.children }
                </div>
            );
        } else {
            return null;
        }
    }
}