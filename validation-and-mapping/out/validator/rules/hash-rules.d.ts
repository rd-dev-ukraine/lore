import { ValidationRule } from "../definitions";
import { EnclosingValidationRuleBase } from "./rules-base";
export interface IHash<TElement> {
    [key: string]: TElement;
}
export declare class HashValidationRule<TElement> extends EnclosingValidationRuleBase<IHash<TElement>> {
    private elementValidationRule;
    private skipInvalidElementsProp;
    private filterHashFn;
    private stopOnMainRuleFailure;
    constructor(elementValidationRule: ValidationRule<TElement>, skipInvalidElementsProp: boolean, filterHashFn: (key: string, value?: TElement) => boolean, stopOnMainRuleFailure: any);
    protected clone(): this;
    /**
     * Don't fail on invalid element. Instead don't include invalid elements in result hash.
     * Note new rule never fails instead return empty hash.
     */
    skipInvalidElements(skipInvalidElements?: boolean): this;
    /** Filter result hash by applying predicate to each hash item and include only items passed the test. */
    filter(predicate: (key: string, value?: TElement) => boolean): this;
    private makeCopy();
}
/**
 * Validates a map of objects with the same structure.
 */
export declare function hash<TElement>(elementValidationRule: ValidationRule<TElement>, stopOnFailure?: boolean): HashValidationRule<TElement>;
