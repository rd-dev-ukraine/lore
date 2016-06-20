import { IValidationContext } from "./definitions";
import ErrorAccumulator from "./error-accumulator";
export default class ValidationContext implements IValidationContext {
    path: string;
    private errorAccumulator;
    private errorCallback;
    private errorBuffer;
    constructor(path: string, errorAccumulator: ErrorAccumulator, errorCallback?: (errorMessage: string) => boolean);
    reportError(message: string): void;
    property(propertyName: string, errorCallback?: (errorMessage: string) => boolean): ValidationContext;
    index(index: number, errorCallback?: (errorMessage: string) => boolean): ValidationContext;
    private nest(path, errorCallback);
    bufferErrors(): ValidationContext;
    flushErrors(): void;
}
