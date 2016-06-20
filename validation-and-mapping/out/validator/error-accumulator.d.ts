import { ValidationErrorHash } from "./definitions";
export default class ErrorAccumulator {
    private errorHash;
    private isValid;
    report(path: string, errorMessage: string): void;
    errors(): ValidationErrorHash;
    valid(): boolean;
}
