/// <reference path="./validator.d.ts" />

import ErrorAccumulator from "./error-accumulator";

export default class ValidationContext {
    constructor(
        public path: string,
        private errorAccumulator: ErrorAccumulator) {
    }

    reportError(message: string): void {
        this.errorAccumulator
            .report(this.path, message);
    }

    property(propertyName: string): ValidationContext {
        return this.nest(propertyName);
    }

    index(index: number): ValidationContext {
        return this.nest(`[${index}]`);
    }

    private nest(path: string): ValidationContext {
        if (!path) {
            throw new Error("path is undefined");
        }

        let fullPath = path;
        if (this.path) {
            fullPath = path[0] === "[" ? this.path + path : this.path + "." + path;
        }

        return new ValidationContext(
            fullPath,
            this.errorAccumulator
        );
    }    
}