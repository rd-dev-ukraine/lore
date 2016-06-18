import { ValidationRule, IValidationContext } from "../definitions";
import { EnclosingValidationRuleBase  } from "./rules-base";

export interface IPropertyValidationHash {
    [property: string]: ValidationRule<any>;
}

export interface IObject {
    [property: string]: any;
}

class ObjectValidationRuleCore<T extends IObject> implements ValidationRule<T> {

    constructor(
        private properties: IPropertyValidationHash,
        private expandable: boolean) {

        if (!properties) {
            throw new Error("Properties is required.");
        }
    }

    runParse(obj: any, validatingObject?: any, rootObject?: any): T {
        if (obj === null || obj === undefined) {
            return obj;
        }

        const result = <T>{};

        for (let property in this.properties) {

            const validator = this.properties[property];
            const sourceValue = obj[property];

            const parsedValue = validator.runParse(sourceValue, obj, rootObject);
            result[property] = parsedValue;            
        }

        if (this.expandable) {
            for (let property in obj) {
                if (!this.properties[property]) {
                    result[property] = obj[property];
                }
            }
        }        

        return result;
    }

    runValidate(
        context: IValidationContext,
        doneCallback: (success: boolean) => void,
        obj: any,
        validatingObject?: any,
        rootObject?: any): void {

        const propertyRules: Array<{ property: string; validator: ValidationRule<any>; }> = [];
        for (let property in this.properties) {
            const validator = this.properties[property];
            propertyRules.push({
                property,
                validator
            });
        }

        let allValid = true;
        const run = () => {
            const rule = propertyRules.shift();
            if (rule) {
                const propertyContext = context.property(rule.property);
                const propertyValue = obj[rule.property];
                rule.validator.runValidate(
                    propertyContext,
                    (success) => {
                        allValid = allValid && success;

                        run();
                    },
                    propertyValue,
                    obj,
                    rootObject
                );
            }
            else {
                doneCallback(allValid);
            }
        };

        run();
    }
}

export class ObjectValidationRule<T extends IObject> extends EnclosingValidationRuleBase<T> {

    constructor(private properties: IPropertyValidationHash,
        private isExpandable: boolean) {
        super(new ObjectValidationRuleCore<T>(properties, isExpandable));
    }

    protected clone(): this {
        return <this>new ObjectValidationRule<T>(this.properties, this.isExpandable);
    }

    expandable(): this {
        return <this>new ObjectValidationRule<T>(this.properties, false);
    }
}

export function obj<T>(properties: IPropertyValidationHash): ObjectValidationRule<T> {
    return new ObjectValidationRule<T>(properties, false);
}