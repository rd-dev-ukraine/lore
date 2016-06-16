/// <reference path="../validator.d.ts" />

import ValidationContext from "../validation-context";

interface IHash<TElement> {
    [key: string]: TElement;
}

class HashValidationRule<TInElement, TOutElement> implements IValidationRule<IHash<TInElement>, IHash<TOutElement>> {
    private keyFilteringFunction: (key: any) => boolean;

    constructor(
        private elementValidationRule: IValidationRule<TInElement, TOutElement>,
        private passNullObject: boolean,
        private nullObjectErrorMessage?: string) {

        if (!elementValidationRule)
            throw new Error("Element validation rule required");
        if (!passNullObject && !nullObjectErrorMessage)
            throw new Error("Validation message for null object required");
    }

    run(value: IHash<TInElement>, validationContext: ValidationContext, entity: any, root: any): IHash<TOutElement> {
        if (value === null || value === undefined) {
            if (!this.passNullObject)
                validationContext.reportError(this.nullObjectErrorMessage);

            return <IHash<TOutElement>><any>value;
        }

        const result = {};

        for (let key in value) {
            if (this.keyFilteringFunction && !this.keyFilteringFunction(key))
                continue;

            const nestedValidationContext = validationContext.property(key);

            result[key] = this.elementValidationRule.run(value[key], nestedValidationContext, value, root);
        }

        return <IHash<TOutElement>><any>result;
    }

    filterKeys(predicate: (key: any) => boolean): HashValidationRule<TInElement, TOutElement> {
        this.keyFilteringFunction = predicate;

        return this;
    }
}


/**
 * Validates object hash (an object each property of which has the same structure).
 */
export function hash<TInElement, TOutElement>(elementValidationRule: IValidationRule<TInElement, TOutElement>, nullValueErrorMessage: string = "Object is required."): HashValidationRule<TInElement, TOutElement> {
    return new HashValidationRule<TInElement, TOutElement>(elementValidationRule, false, nullValueErrorMessage);
}

/**
 * Validates object hash (an object each property of which has the same structure).
 */
export function hashOptional<TInElement, TOutElement>(elementValidationRule: IValidationRule<TInElement, TOutElement>): HashValidationRule<TInElement, TOutElement> {
    return new HashValidationRule<TInElement, TOutElement>(elementValidationRule, true);
}