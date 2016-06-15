/// <reference path="../validator.d.ts" />

import { IValidationRule, ChainableRuleRunner } from "./rules";

class StringRules extends ChainableRuleRunner<string> {

    notEmpty(errorMessage: string = "Value can not be empty"): this {
        return this.withRule(StringRules.notEmtpyRule(errorMessage));
    }

    must(predicate: (value: string, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        return this.withRule(ChainableRuleRunner.mustRule(predicate, errorMessage));
    }

    static isStringRule(errorMessage: string, convert: boolean): IValidationTransform<any, string> {
        return (value: any, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined)
                return value;

            if (typeof value !== "string" && !convert)
                reportError(errorMessage);

            return value.toString();
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

    must(predicate: (value: number, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        return this.withRule(ChainableRuleRunner.mustRule(predicate, errorMessage));
    }


    static isNumberRule(errorMessage: string): IValidationTransform<any, number> {
        return (value: any, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined)
                return value;

            if (typeof value !== "number") {
                const result = parseFloat("" + value);

                if (isNaN(result))
                    reportError(errorMessage);

                return result;
            }

            return value;
        };
    }
}

export function str(errorMessage: string = "Value is not a string.", convert: boolean = true): StringRules {
    return new StringRules().withRule(StringRules.isStringRule(errorMessage, convert));
}

export function num(errorMessage: string = "Value is not a valid number"): NumberRules {
    return new NumberRules().withRule(NumberRules.isNumberRule(errorMessage));
}