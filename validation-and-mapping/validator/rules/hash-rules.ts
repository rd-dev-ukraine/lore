import { ValidationRule } from "../definitions";

import ValidationContext from "../validation-context";

export interface IHash<TElement> {
    [key: string]: TElement;
}

class HashValidationRuleCore<TElement> implements ValidationRule<IHash<TElement>> {    

    constructor(
        private elementValidationRule: ValidationRule<TElement>,
        private skipInvalidElements: boolean,
        private filterHashFn: (key: string, value: TElement) => boolean) {

        if (!elementValidationRule) {
            throw new Error("Element validation rule required");
        }
    }

    run(value: IHash<TInElement>, validationContext: ValidationContext, entity: any, root: any): IHash<TOutElement> {
        if (value === null || value === undefined) {
            if (!this.passNullObject) {
                validationContext.reportError(this.nullObjectErrorMessage);
            }

            return <IHash<TOutElement>><any>value;
        }

        if (this.mustPredicate && !this.mustPredicate(value, entity, root)) {
            validationContext.reportError(this.mustErrorMessage);

            return <IHash<TOutElement>><any>value;
        }

        const result: IHash<TOutElement> = {};

        for (let key in value) {
            if (this.keyFilteringFunction && !this.keyFilteringFunction(key)) {
                continue;
            }

            let valid = true;
            const nestedValidationContext = validationContext.property(key, () => {
                valid = false;
                return !this.skipInvalid;
            });

            const convertedValue = this.elementValidationRule.run(value[key], nestedValidationContext, value, root);
            if (valid || !this.skipInvalid) {
                result[key] = convertedValue;
            }
        }

        return <IHash<TOutElement>><any>result;
    }    
}


// /**
//  * Validates object hash (an object each property of which has the same structure).
//  */
// export function hash<TInElement, TOutElement>(elementValidationRule: IValidationRule<TInElement, TOutElement>, nullValueErrorMessage: string = "Object is required."): HashValidationRule<TInElement, TOutElement> {
//     return new HashValidationRule<TInElement, TOutElement>(elementValidationRule, false, nullValueErrorMessage);
// }

// /**
//  * Validates object hash (an object each property of which has the same structure).
//  */
// export function hashOptional<TInElement, TOutElement>(elementValidationRule: IValidationRule<TInElement, TOutElement>): HashValidationRule<TInElement, TOutElement> {
//     return new HashValidationRule<TInElement, TOutElement>(elementValidationRule, true);
// }
