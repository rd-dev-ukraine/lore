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

    let val = value;
    let valid = true;
    const runValidator = () => {
        const validator = validators.shift();

        if (validator) {
            val = validator.runParse(val, val, val);

            validator.runValidate(
                validationContext,
                success => {
                    valid = valid && success;

                    // Run next validator recursively.
                    runValidator();
                },
                val,
                value,
                value);
        }
        else {

            if (errorAccumulator.valid()) {
                const validationResult: ValidationResult<T> = {
                    valid: true,
                    convertedValue: val
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
        }        
    };

    runValidator();
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