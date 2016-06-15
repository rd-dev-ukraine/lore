/// <reference path="./validator.d.ts" />
import ErrorAccumulator from "./error-accumulator";
import ValidationContext from "./validation-context";
import { IValidationRule } from "./rules";

export * from "./primitive-types";

export class validator {
    static run<TIn, TOut>(value: TIn, validator: IValidationRule<TIn, TOut>): ValidationResult<TOut> {
        const errorAccumulator = new ErrorAccumulator();
        const validationContext = new ValidationContext("", errorAccumulator);

        const result = validator.run(value, validationContext, value, value);
        const errors = errorAccumulator.errors();

        if (Object.keys(errors).length) {
            return {
                valid: false,
                value: result,
                errors: errors
            };
        }

        return {
            valid: true,
            value: result
        }
    }
}