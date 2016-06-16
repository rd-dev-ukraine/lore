/// <reference path="../validator.d.ts" />

import ValidationContext from "../validation-context";

class ArrayValidationRule<TInElement, TOutElement> implements IValidationRule<TInElement[], TOutElement[]> {
    private filter: (elem: TInElement, entity?: any, root?: any) => boolean;
    private keepOnlyValidElements: boolean = false;

    constructor(
        private elementValidator: IValidationRule<TInElement, TOutElement>,
        private passNullOrEmptyArray: boolean,
        private nullOrEmptyArrayErrorMessage: string) {

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
        }
    }
}