/// <reference path="./validator.d.ts" />

import ValidationContext from "./validation-context";

export interface IValidationRule<TIn, TOut> {
    run(value: TIn, context: ValidationContext) : TOut;
}