import { ValidationErrorHash } from "./definitions";

export default class ErrorAccumulator {
    private errorHash: ValidationErrorHash = {};
    private isValid = true;

    report(path: string, errorMessage: string): void {
        if (!errorMessage) {
            return;
        }

        const messages = this.errorHash[path] = (this.errorHash[path] || []);
        messages.push(errorMessage);
        
        this.isValid = false;
    }

    errors(): ValidationErrorHash {
        return this.errorHash;
    }

    valid() {
        return this.isValid;
    }
}
