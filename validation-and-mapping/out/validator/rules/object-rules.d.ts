import { ValidationRule } from "../definitions";
import { EnclosingValidationRuleBase } from "./rules-base";
export interface IPropertyValidationHash {
    [property: string]: ValidationRule<any>;
}
export interface IObject {
    [property: string]: any;
}
export declare class ObjectValidationRule<T extends IObject> extends EnclosingValidationRuleBase<T> {
    private properties;
    private isExpandable;
    private stopsOnMainRuleFailure;
    constructor(properties: IPropertyValidationHash, isExpandable: boolean, stopsOnMainRuleFailure: boolean);
    protected clone(): this;
    expandable(): this;
    private makeCopy();
}
export declare function obj<T>(properties: IPropertyValidationHash, stopOnFailure?: boolean): ObjectValidationRule<T>;
