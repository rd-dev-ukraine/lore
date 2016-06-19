import { ValidationRule, ValidationResult } from "./definitions";
import ErrorAccumulator from "./error-accumulator";
import ValidationContext from "./validation-context";

import * as rules from "./rules";

export * from "./definitions";
export { rules };

export function validateWithCallback<T>(value: any, done: (result: ValidationResult<T>) => void, ...validators: ValidationRule<T>[]): void {
    if (!done) {
        throw new Error("Done callback is required.");
    }
    if (!validators || !validators.length) {
        throw new Error("At least one validator is required");
    }

    const errorAccumulator = new ErrorAccumulator();
    const validationContext = new ValidationContext("", errorAccumulator);

    const rule = rules.combineRules(...validators);

    const parsedValue = rule.runParse(value, value, value);

    rule.runValidate(
        validationContext,
        () => {
            if (errorAccumulator.valid()) {
                const validationResult: ValidationResult<T> = {
                    valid: true,
                    convertedValue: parsedValue
                };
                done(validationResult);
            }
            else {
                const validationResult: ValidationResult<T> = {
                    valid: false,
                    convertedValue: null,
                    errors: errorAccumulator.errors()
                };
                done(validationResult);
            }
        },
        parsedValue,
        parsedValue,
        parsedValue);
}

export function validateWithPromise<T>(value: any, ...validators: ValidationRule<T>[]): Promise<T> {
    if (!validators || !validators.length) {
        throw new Error("At least one validator is required");
    }

    return new Promise((resolve, reject) => {
        validateWithCallback(
            value,
            result => {
                if (result.valid) {
                    resolve(result.convertedValue);
                }
                else {
                    reject(result.errors);
                }
            },
            ...validators);
    });
}