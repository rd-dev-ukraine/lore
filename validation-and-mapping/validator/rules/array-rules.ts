/// <reference path="../validator.d.ts" />

import ValidationContext from "../validation-context";

class ArrayValidationRule<TInElement, TOutElement> implements IValidationRule<TInElement[], TOutElement[]> {
    private filter: (elem: TInElement, entity?: any, root?: any) => boolean;
    private keepOnlyValidElements: boolean = false;

    constructor(
        private elementValidator: IValidationRule<TInElement, TOutElement>,
        private passNullOrEmptyArray: boolean,
        private nullOrEmptyArrayErrorMessage?: string) {

        if (!this.passNullOrEmptyArray && !this.nullOrEmptyArrayErrorMessage)
            throw new Error("Null or empty array error message required is null array is not passed");
    }

    run(value: TInElement[], validationContext: ValidationContext, entity: any, root: any): TOutElement[] {
        if (value === null || value === undefined || value.length === 0) {
            if (!this.passNullOrEmptyArray)
                validationContext.reportError(this.nullOrEmptyArrayErrorMessage);

            return <TOutElement[]><any>value;
        }

        const result = [];

        for (let i = 0; i < value.length; i++) {
            const elem = value[i];

            if (this.filter && !this.filter(elem, value, root))
                continue;

            let valid = true;

            const nestedValidationContext = validationContext.index(result.length, () => {
                valid = false;
                return !this.keepOnlyValidElements;
            });

            const convertedValue = this.elementValidator.run(elem, nestedValidationContext, value, root);
            if (valid || !this.keepOnlyValidElements)
                result.push(convertedValue);

        }

        return result;
    }

    keepOnlyValid(onlyValid: boolean = true): this {
        this.keepOnlyValidElements = onlyValid;
        return this;
    }

    filterElements(predicate: (elem: TInElement, entity?: any, root?: any) => boolean): this {
        if (!predicate)
            throw new Error("predicate is required");

        this.filter = predicate;

        return this;
    }
}

export function arr<TInElement, TOutElement>(elementValidationRule: IValidationRule<TInElement, TOutElement>, nullValueErrorMessage: string = "Value is required."): ArrayValidationRule<TInElement, TOutElement> {
    return new ArrayValidationRule<TInElement, TOutElement>(elementValidationRule, true, nullValueErrorMessage);
}

export function arrOptional<TInElement, TOutElement>(elementValidator: IValidationRule<TInElement, TOutElement>): ArrayValidationRule<TInElement, TOutElement> {
    return new ArrayValidationRule<TInElement, TOutElement>(elementValidator, false);
}