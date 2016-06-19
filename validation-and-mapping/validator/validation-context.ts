import { IValidationContext } from "./definitions";

import ErrorAccumulator from "./error-accumulator";

export default class ValidationContext implements IValidationContext {
    private errorBuffer: ErrorAccumulator = null;

    constructor(
        public path: string,
        private errorAccumulator: ErrorAccumulator,
        private errorCallback: (errorMessage: string) => boolean = null) {
    }

    reportError(message: string): void {
        if (this.errorCallback && !this.errorCallback(message)) {
            return;
        }

        (this.errorBuffer || this.errorAccumulator).report(this.path, message);
    }

    property(propertyName: string, errorCallback?: (errorMessage: string) => boolean): ValidationContext {
        return this.nest(propertyName, errorCallback);
    }

    index(index: number, errorCallback?: (errorMessage: string) => boolean): ValidationContext {
        return this.nest(`[${index}]`, errorCallback);
    }

    private nest(path: string, errorCallback: (errorMessage: string) => boolean): ValidationContext {
        if (!path) {
            throw new Error("path is undefined");
        }

        let fullPath = path;
        if (this.path) {
            fullPath = path[0] === "[" ? this.path + path : this.path + "." + path;
        }

        return new ValidationContext(
            fullPath,
            this.errorAccumulator,
            errorCallback
        );
    }

    bufferErrors() {
        const result = new ValidationContext(this.path, this.errorAccumulator, this.errorCallback);
        result.errorBuffer = new ErrorAccumulator();

        return result;
    }

    flushErrors() {
        if (this.errorBuffer) {
            const errors = this.errorBuffer.errors();
            Object.keys(errors)
                .forEach(path => {
                    const messages = errors[path];
                    messages.forEach(message => this.errorAccumulator.report(path, message));
                });
        }

        this.errorBuffer = null;
    }
}
