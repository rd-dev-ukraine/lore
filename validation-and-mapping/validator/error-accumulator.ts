/// <reference path="./validator.d.ts" />

export class ErrorAccumulator {
    private errorHash: ValidationErrors = {};

    report(path: string, errorMessage: string) {
        if (!errorMessage) {
            return;
        }

        const messages = this.errorHash[path] = (this.errorHash[path] || []);

        messages.push(errorMessage);
    }

    errors(): ValidationErrors {
        return this.errorHash;
    }
}