import { ValidateAndTransformFunc, ReportErrorFunction } from "../definitions";
import { ChainableRuleRunner } from "./rules-base";

export class StringRules extends ChainableRuleRunner<string> {

    notEmpty(errorMessage: string = "Value can not be empty"): this {
        return this.withRule(StringRules.notEmtpyRule(errorMessage));
    }

    static isStringRule(errorMessage: string, convert: boolean): ValidateAndTransformFunc<any, string> {
        return (value: any, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined) {
                return value;
            }

            if (typeof value !== "string" && !convert) {
                reportError(errorMessage);
            }

            return value.toString();
        };
    }

    static notEmtpyRule(errorMessage: string): ValidateAndTransformFunc<string, string> {
        return (value: string, reportError: ReportErrorFunction) => {
            if (!value || !value.trim()) {
                reportError(errorMessage);
            }

            return value;
        };
    }
}

export class NumberRules extends ChainableRuleRunner<number> {

    static isNumberRule(errorMessage: string): ValidateAndTransformFunc<any, number> {
        return (value: any, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined) {
                return value;
            }

            if (typeof value !== "number") {
                const result = parseFloat("" + value);

                if (isNaN(result)) {
                    reportError(errorMessage);
                }

                return result;
            }

            return value;
        };
    }
}

export class AnyRules<T> extends ChainableRuleRunner<T> {
}

export function str(errorMessage: string = "Value is not a string.", convert: boolean = true): StringRules {
    return new StringRules().withRule(StringRules.isStringRule(errorMessage, convert));
}

export function num(errorMessage: string = "Value is not a valid number"): NumberRules {
    return new NumberRules().withRule(NumberRules.isNumberRule(errorMessage));
}

export function any<T>(predicate?: (value: T, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): AnyRules<T> {
    predicate = predicate || (v => true);
    return new AnyRules<T>().must(predicate, errorMessage);
}
