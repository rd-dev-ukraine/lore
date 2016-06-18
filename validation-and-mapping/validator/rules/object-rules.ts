import { ValidationRule, IValidationContext } from "../definitions";

export interface IPropertyValidationHash {
    [property: string]: ValidationRule<any>;
}

export interface IObject {
    [property: string]: any;
}

export class ObjectValidationRules<T extends IObject> implements ValidationRule<T> {
    protected settings: {
        expandable: boolean;
        required: boolean;
        requiredError: string;
        [setting: string]: any;
    } = {
        expandable: false,
        required: false,
        requiredError: ""
    };

    constructor(private properties: IPropertyValidationHash) {

        if (!properties) {
            throw new Error("Properties is required.");
        }
    }

    /** Enables or disables validating value to have properties not defined in property validation hash. */
    expandable(isExpandable = true): this {
        const result = this.clone();
        result.settings.expandable = isExpandable;
        return result;
    }

    /** Enables or disables null object. */
    required(isRequired = true, errorMessage = "Object is required."): this {
        if (!errorMessage) {
            throw new Error("Error message is required");
        }

        const result = this.clone();

        result.settings.required = isRequired;
        result.settings.requiredError = errorMessage;

        return result;
    }

    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T {
        if (inputValue === null || inputValue === undefined) {
            return inputValue;
        }

        const result = <T>{};

        for (let property in this.properties) {
            if (inputValue.hasOwnProperty(property)) {
                const validator = this.properties[property];
                const sourceValue = inputValue[property];

                result[property] = validator.runParse(sourceValue, inputValue, rootObject);
            }
        }

        if (this.settings.expandable) {
            for (let property in inputValue) {
                if (!this.properties[property]) {
                    result[property] = inputValue[property];
                }
            }
        }

        return result;
    }

    runValidate(
        context: IValidationContext,
        doneCallback: (success: boolean) => void,
        parsedValue: any,
        validatingObject?: any,
        rootObject?: any): void {

        if (this.settings.required) {
            if (parsedValue === null || parsedValue === undefined) {
                context.reportError(this.settings.requiredError);
                doneCallback(false);
                return;
            }
        }

        const propertyRules: Array<{ property: string; validator: ValidationRule<any>; }> = [];
        for (let property in this.properties) {
            if (this.properties.hasOwnProperty(property)) {
                const validator = this.properties[property];
                propertyRules.push({
                    property,
                    validator
                })
            }
        }

        let allValid = true;
        const run = () => {
            const rule = propertyRules.shift();
            if (rule) {
                const propertyContext = context.property(rule.property);
                const valueToValidate = parsedValue[rule.property];
                rule.validator.runValidate(
                    propertyContext,
                    (success) => {
                        allValid = allValid && success;

                        run();
                    },
                    valueToValidate,
                    parsedValue,
                    rootObject
                );
            }
            else {
                doneCallback(allValid);
            }
        };

        run();
    }

    protected clone(): this {
        const result = new ObjectValidationRules<T>(this.properties);
        result.settings = JSON.parse(JSON.stringify(this.settings));

        return <this>result;
    }
}

