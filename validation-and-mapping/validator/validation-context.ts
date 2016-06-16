/// <reference path="./validator.d.ts" />

import ErrorAccumulator from "./error-accumulator";

export default class ValidationContext implements IValidationContext {
    constructor(
        public path: string,
        private errorAccumulator: ErrorAccumulator,
        private errorCallback: (errorMessage: string) => boolean) {
    }

    reportError(message: string): void {
        if (this.errorCallback && !this.errorCallback(message))
            return;

        this.errorAccumulator
            .report(this.path, message);
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
}