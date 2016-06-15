/// <reference path="./validator.d.ts" />
import ValidationContext from "./validation-context";
import { IValidationRule } from "./rules";

class ChainableRuleRunner<TOut> implements IValidationRule<any, TOut> {
    constructor(public rules: IValidationTransform<any, string>[]) {
    }

    run(value: any, validationContext: ValidationContext): TOut {
        return this.rules
            .reduce((currentValue, rule) => rule(currentValue, err => validationContext.reportError(err)), value);
    }
}

class StringRules extends ChainableRuleRunner<string> {

    constructor(rules: IValidationTransform<any, string>[]) {
        super(rules);
    }

    notEmpty(errorMessage: string = "Value can not be empty"): StringRules {
        return new StringRules([StringRules.notEmtpyRule(errorMessage), ...this.rules]);
    }

    static isStringRule(errorMessage: string): IValidationTransform<any, string> {
        return (value: any, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined)
                return value;

            if (typeof value !== "string")
                reportError(errorMessage);

            return value;
        };
    }

    static notEmtpyRule(errorMessage: string): IValidationTransform<string, string> {
        return (value: string, reportError: ReportErrorFunction) => {
            if (!value || !value.trim())
                reportError(errorMessage);

            return value;
        }
    }
}

class NumberRules extends ChainableRuleRunner<number> {

    constructor(rules: IValidationTransform<any, number>[]) {
        super(rules);
    }

    must(predicate: (value: number, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): NumberRules {
        return new NumberRules([...this.rules, NumberRules.mustRule(predicate, errorMessage)]);
    }


    static isNumberRule(errorMessage: string): IValidationTransform<any, number> {
        return (value: any, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined)
                return value;

            if (typeof value !== "number") {
                reportError(errorMessage);
                return parseFloat("" + value);
            }

            return value;
        };
    }

    static mustRule(predicate: (value: number, entity?: any, rootEntity?: any) => boolean, errorMessage: string): IValidationTransform<number, number> {
        return (value, reportError: ReportErrorFunction, entity, rootEntity) => {
            if (!predicate(value, entity, rootEntity)) {
                reportError(errorMessage);
            }

            return value;
        };
    }

}

export function str(errorMessage: string = "Value is not a string."): StringRules {
    return new StringRules([StringRules.isStringRule(errorMessage)]);
}

export function num(errorMessage: string = "Value is not a valid number") : NumberRules {
    return new NumberRules([NumberRules.isNumberRule(errorMessage)]);
}