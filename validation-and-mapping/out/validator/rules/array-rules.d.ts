import { ValidationRule, IValidationContext } from "../definitions";
import { EnclosingValidationRuleBase } from "./rules-base";
export declare class ArrayValidationRuleCore<TElement> implements ValidationRule<TElement[]> {
    private elementValidationRule;
    private skipInvalidElements;
    private filterElementFn;
    stopOnFailure: boolean;
    constructor(elementValidationRule: ValidationRule<TElement>, skipInvalidElements: boolean, filterElementFn: (element: TElement, index?: number) => boolean, stopOnFailure: boolean);
    runParse(array: any[], validatingObject?: any, rootObject?: any): TElement[];
    runValidate(context: IValidationContext, doneCallback: (success: boolean) => void, array: any[], validatingObject?: any, rootObject?: any): void;
}
export declare class ArrayValidationRule<TElement> extends EnclosingValidationRuleBase<TElement[]> {
    private elementValidationRule;
    private skipInvalidElementsProp;
    private filterElementFn;
    private stopOnMainRuleFailure;
    constructor(elementValidationRule: ValidationRule<TElement>, skipInvalidElementsProp: boolean, filterElementFn: (element: TElement, index?: number) => boolean, stopOnMainRuleFailure: any);
    protected clone(): this;
    /**
     * Don't fail on invalid element. Instead don't include invalid elements in result array.
     * Note new rule never fails instead it returns empty array.
     */
    skipInvalidElements(skipInvalidElements?: boolean): this;
    /** Filter result array by applying predicate to each hash item and include only items passed the test. */
    filter(predicate: (element: TElement, index?: number) => boolean): this;
    private makeCopy();
}
/** Validates an array of the elements with the same structure. */
export declare function arr<TElement>(elementValidationRule: ValidationRule<TElement>, stopOnFailure?: boolean): ArrayValidationRule<TElement>;
