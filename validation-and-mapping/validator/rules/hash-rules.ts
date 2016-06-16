/// <reference path="../validator.d.ts" />

import ValidationContext from "../validation-context";

interface IHash<TElement> {
    [key: string]: TElement;
}

class HashValidationRule<TInElement, TOutElement> implements IValidationRule<IHash<TInElement>, IHash<TOutElement>> {
    private keyFilteringFunction: (key: any) => boolean;
    private skipInvalid = false;

    private mustPredicate: (value: IHash<TInElement>, entity?: any, rootEntity?: any) => boolean;
    private mustErrorMessage: string;

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

        if (this.mustPredicate && !this.mustPredicate(value, entity, root)) {
            validationContext.reportError(this.mustErrorMessage);

            return <IHash<TOutElement>><any>value;
        }

        const result = {};

        for (let key in value) {
            if (this.keyFilteringFunction && !this.keyFilteringFunction(key))
                continue;

            let valid = true;
            const nestedValidationContext = validationContext.property(key, () => {
                valid = false;
                return !this.skipInvalid;
            });

            const convertedValue = this.elementValidationRule.run(value[key], nestedValidationContext, value, root);
            if (valid || !this.skipInvalid)
                result[key] = convertedValue;
        }

        return <IHash<TOutElement>><any>result;
    }

    must(predicate: (value: IHash<TInElement>, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        if (!predicate)
            throw new Error("predicate is required");
        if (!errorMessage)
            throw new Error("Error message is required");

        this.mustPredicate = predicate;
        this.mustErrorMessage = errorMessage;

        return this;
    }

    filterKeys(predicate: (key: any) => boolean): this {
        this.keyFilteringFunction = predicate;

        return this;
    }

    keepOnlyValid(onlyValid: boolean = true): this {
        this.skipInvalid = onlyValid;
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