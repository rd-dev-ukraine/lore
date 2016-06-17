/// <reference path="./validator.d.ts" />
import ErrorAccumulator from "./error-accumulator";
import ValidationContext from "./validation-context";

export * from "./rules";

export function validate<TIn, TOut>(value: TIn, ...validators: IValidationRule<TIn, TOut>[]): ValidationResult<TOut> {
    if (!validators || !validators.length) {
        throw new Error("At least one validator is required");
    }

    const errorAccumulator = new ErrorAccumulator();
    const validationContext = new ValidationContext("", errorAccumulator);

    const result = <TOut><any>validators.reduce((val, validator) =>  <TIn><any>validator.run(val, validationContext, val, val) || value, value);

    const errors = errorAccumulator.errors();

    if (Object.keys(errors).length) {
        return {
            valid: false,
            value: null,
            errors: errors
        };
    }

    return {
        valid: true,
        value: result
    };
}
