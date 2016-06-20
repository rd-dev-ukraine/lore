import { ValidationRule, ValidationResult } from "./definitions";
import * as rules from "./rules";
export * from "./definitions";
export { rules };
export declare function validateWithCallback<T>(value: any, done: (result: ValidationResult<T>) => void, ...validators: ValidationRule<T>[]): void;
export declare function validateWithPromise<T>(value: any, ...validators: ValidationRule<T>[]): Promise<T>;
