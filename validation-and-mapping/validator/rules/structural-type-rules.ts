/// <reference path="../validator.d.ts" />
import { IValidationRule, ChainableRuleRunner } from "./rules";

export interface IPropertyValidationHash {
    [property: string]: IValidationRule<any, any>;
}

/**
 * 
 */
export function obj<TIn, TOut>(struct: IPropertyValidationHash): IValidationRule<TIn, TOut> {
    throw new Error();
}