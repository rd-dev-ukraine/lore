/// <reference path="../validator.d.ts" />
import ValidationContext from "../validation-context";

export interface IPropertyValidationHash {
    [property: string]: IValidationRule<any, any>;
}

class ObjectValidationRule<TIn, TOut> implements IValidationRule<TIn, TOut> {

    constructor(
        private struct: IPropertyValidationHash,
        private passNullObject: boolean,
        private nullObjectErrorMessage?: string) {
        if (!struct)
            throw new Error("object structure descriptor is required");
        if (!passNullObject && !nullObjectErrorMessage)
            throw new Error("Validation message for null object required");
    }

    run(value: TIn, validationContext: ValidationContext, entity: any, root: any): TOut {
        if (value === null || value === undefined) {
            if (!this.passNullObject)
                validationContext.reportError(this.nullObjectErrorMessage);

            return <TOut><any>value;
        }

        const result = {};

        for (let property in this.struct) {
            const rule = this.struct[property];
            const inputValue = value[property];

            const nestedContext = validationContext.property(property);

            result[property] = rule.run(inputValue, nestedContext, value, root);
        }

        return <TOut>result;
    }
}

class ExpandableObjectValidationRule<TIn, TOut> implements IValidationRule<TIn, TOut> {

    constructor(
        private struct: IPropertyValidationHash,
        private passNullObject: boolean,
        private nullObjectErrorMessage?: string) {
        if (!struct)
            throw new Error("object structure descriptor is required");
        if (!passNullObject && !nullObjectErrorMessage)
            throw new Error("Validation message for null object required");
    }

    run(value: TIn, validationContext: ValidationContext, entity: any, root: any): TOut {
        if (value === null || value === undefined) {
            if (!this.passNullObject)
                validationContext.reportError(this.nullObjectErrorMessage);

            return <TOut><any>value;
        }

        const result = {};

        for (let property in value) {
            const rule = this.struct[property];

            if (rule) {
                const inputValue = value[property];
                const nestedContext = validationContext.property(property);
                result[property] = rule.run(inputValue, nestedContext, value, root);
            }
            else {
                result[property] = value[property];
            }
        }

        return <TOut>result;
    }
}


/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be omitted from the result.
 */
export function obj<TIn, TOut>(struct: IPropertyValidationHash, nullObjectErrorMessage: string = "Object required"): IValidationRule<TIn, TOut> {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule<TIn, TOut>(struct, false, nullObjectErrorMessage);
}

/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be omitted from the result.
 * This validator doesn't fail on null value.
 */
export function objOptional<TIn, TOut>(struct: IPropertyValidationHash): IValidationRule<TIn, TOut> {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule<TIn, TOut>(struct, true);
}

/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be preserved as is in result.
 */
export function expandableObject<TIn, TOut>(struct: IPropertyValidationHash, nullObjectErrorMessage: string = "Object required"): IValidationRule<TIn, TOut> {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ExpandableObjectValidationRule<TIn, TOut>(struct, false, nullObjectErrorMessage);
}

/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be preserved as is in result.
 * This validator doesn't fail on null value.
 */
export function optionalExpandableObject<TIn, TOut>(struct: IPropertyValidationHash): IValidationRule<TIn, TOut> {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }

    return new ExpandableObjectValidationRule<TIn, TOut>(struct, true);
}