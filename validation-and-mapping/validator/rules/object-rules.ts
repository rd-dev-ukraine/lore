/// <reference path="../validator.d.ts" />
import ValidationContext from "../validation-context";

export interface IPropertyValidationHash {
    [property: string]: IValidationRule<any, any>;
}

export interface IObject {
    [property: string]: any;
}

export abstract class ObjectValidationRuleBase<TIn, TOut> implements IValidationRule<TIn, TOut> {
    private mustPredicate: (value: TIn, entity: any, root: any) => boolean;
    private mustError = "";

    constructor(
        protected struct: IPropertyValidationHash,
        protected passNullObject: boolean,
        protected nullObjectErrorMessage?: string) {
        if (!struct) {
            throw new Error("object structure descriptor is required");
        }
        if (!passNullObject && !nullObjectErrorMessage) {
            throw new Error("Validation message for null object required");
        }
    }

    run(value: TIn, validationContext: ValidationContext, entity: any, root: any): TOut {
        if (value === null || value === undefined) {
            if (!this.passNullObject) {
                validationContext.reportError(this.nullObjectErrorMessage);
            }

            return <TOut><any>value;
        }

        if (this.mustPredicate && !this.mustPredicate(value, entity, root)) {
            validationContext.reportError(this.mustError);
        }

        return this.runCore(value, validationContext, entity, root);
    }

    must(predicate: (value: TIn, entity?: any, root?: any) => boolean, errorMessage: string = "Object data is not valid."): this {
        if (!predicate) {
            throw new Error("Predicate is requried");
        }
        if (!errorMessage) {
            throw new Error("Error message is required");
        }

        this.mustPredicate = predicate;
        this.mustError = errorMessage;

        return this;
    }

    abstract runCore(value: TIn, validationContext: ValidationContext, entity: any, root: any): TOut;
}

export class ObjectValidationRule<TIn extends IObject, TOut> extends ObjectValidationRuleBase<TIn, TOut> {

    constructor(
        struct: IPropertyValidationHash,
        passNullObject: boolean,
        nullObjectErrorMessage?: string) {

        super(struct, passNullObject, nullObjectErrorMessage);
    }

    runCore(value: TIn, validationContext: ValidationContext, entity: any, root: any): TOut {
        const result: IObject = {};

        for (let property in this.struct) {
            if (this.struct.hasOwnProperty(property)) {
                const rule = this.struct[property];
                const inputValue = value[property];

                const nestedContext = validationContext.property(property);

                result[property] = rule.run(inputValue, nestedContext, value, root);
            }
        }

        return <TOut>result;
    }
}

export class ExpandableObjectValidationRule<TIn extends IObject, TOut> extends ObjectValidationRuleBase<TIn, TOut> {

    constructor(
        struct: IPropertyValidationHash,
        passNullObject: boolean,
        nullObjectErrorMessage?: string) {

        super(struct, passNullObject, nullObjectErrorMessage);
    }

    runCore(value: TIn, validationContext: ValidationContext, entity: any, root: any): TOut {
        const result: IObject = {};

        for (let property in value) {
            if (value.hasOwnProperty(property)) {

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
        }

        return <TOut>result;
    }
}

/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be omitted from the result.
 */
export function obj<TIn, TOut>(struct: IPropertyValidationHash, nullObjectErrorMessage: string = "Object required"): ObjectValidationRule<TIn, TOut> {
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
export function objOptional<TIn, TOut>(struct: IPropertyValidationHash): ObjectValidationRule<TIn, TOut> {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule<TIn, TOut>(struct, true);
}

/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be preserved as is in result.
 */
export function expandableObject<TIn, TOut>(struct: IPropertyValidationHash, nullObjectErrorMessage: string = "Object required"): ExpandableObjectValidationRule<TIn, TOut> {
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
export function optionalExpandableObject<TIn, TOut>(struct: IPropertyValidationHash): ExpandableObjectValidationRule<TIn, TOut> {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }

    return new ExpandableObjectValidationRule<TIn, TOut>(struct, true);
}
