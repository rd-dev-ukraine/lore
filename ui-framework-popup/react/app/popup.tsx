import * as React from "react";
import * as ReactDOM from "react-dom";

export class Popup extends React.Component<{}, {}> {
    popup: HTMLElement;

    constructor() {
        super();
    }

    render() {
        return (<noscript></noscript>);
    }

    componentDidMount() {
        this.renderPopup();
    }

    componentDidUpdate() {
        this.renderPopup();
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this.popup);
        document.body.removeChild(this.popup);
    }
    
    renderPopup() {
        if (!this.popup) {
            this.popup = document.createElement("div");
            document.body.appendChild(this.popup);
        }

        ReactDOM.render(
            <div className="popup-overlay">
                <div className="popup-content">
                    { this.props.children }
                </div>
            </div>,
            this.popup);
    }
}