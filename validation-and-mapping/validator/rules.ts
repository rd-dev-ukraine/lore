/// <reference path="./validator.d.ts" />

import ValidationContext from "./validation-context";

export interface IValidationRule<TIn, TOut> {
    /**
     * Run validation of the specified value with callback to given context.
     * 
     * param @value The immediate value being validated.
     * param @validationContext The validation context for reporting errors.
     * param @entity The entity which properties are currently validated, may be the nested into root entity.
     * param @root The root entity passed to validator.run method.
     */
    run(value: TIn, validationContext: ValidationContext, entity: any, root: any) : TOut;
}