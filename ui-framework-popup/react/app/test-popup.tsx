import * as React from "react";
import * as ReactDOM from "react-dom";

import { IfComponent as Ifc } from "./if";
import { Popup } from "./popup";


export interface TestPopupState {
    text: string;
    isPopupVisible: boolean;
}

export class TestPopup extends React.Component<{}, TestPopupState> {
    constructor() {
        super();

        this.state = {
            text: "Content appear in popup",
            isPopupVisible: false
        };
    }

    render() {
        return (
            <div>
                <div className="form-group">
                    <label>
                        Enter text to display in popup:
                    </label>
                    <input className="form-control"
                        value={ this.state.text }
                        onChange={ e => this.setText(e.target.value) }
                        type="text" />
                </div>
                <p>
                    <button className="btn btn-primary" onClick={e => this.openPopup() } type="button" >
                        Open popup
                    </button>
                </p>

                <Ifc condition={ () => this.state.isPopupVisible } >
                    <Popup>
                        <div className="alert alert-success">
                            <h2>
                                { this.state.text}
                            </h2>
                            <button className="btn btn-warning" onClick={e => this.closePopup() } type="button" >
                                Close popup
                            </button>
                        </div>
                    </Popup>
                </Ifc>
            </div>
        )
    }

    setText(text: string): void {
        this.setState(state => {
            state.text = text;
            return state;
        });
    }

    openPopup(): void {
        this.setState(state => {
            state.isPopupVisible = true;
            return state;
        });
    }

    closePopup(): void {
        this.setState(state => {
            state.isPopupVisible = false;
            return state;
        });
    }

}