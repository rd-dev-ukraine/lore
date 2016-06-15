/// <reference path="./validator.d.ts" />
import ValidationContext from "./validation-context";
import { IValidationRule } from "./rules";

abstract class ChainableRuleRunner<TOut> implements IValidationRule<any, TOut> {
    rules: IValidationTransform<any, TOut>[] = [];

    run(value: any, validationContext: ValidationContext): TOut {
        return this.rules
            .reduce((currentValue, rule) => rule(currentValue, err => validationContext.reportError(err)), value);
    }

    withRule(rule: IValidationTransform<any, TOut>): this {
        this.rules.push(rule);
        return this;
    }

    static mustRule<TIn, TOut>(predicate: (value: TIn, entity?: any, rootEntity?: any) => boolean, errorMessage: string): IValidationTransform<TIn, TOut> {
        return (value, reportError: ReportErrorFunction, entity, rootEntity) => {
            if (!predicate(value, entity, rootEntity)) {
                reportError(errorMessage);
            }

            return value;
        };
    }
}

class StringRules extends ChainableRuleRunner<string> {

    notEmpty(errorMessage: string = "Value can not be empty"): this {
        return this.withRule(StringRules.notEmtpyRule(errorMessage));
    }

    must(predicate: (value: string, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        return this.withRule(ChainableRuleRunner.mustRule(predicate, errorMessage));
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

    must(predicate: (value: number, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        return this.withRule(ChainableRuleRunner.mustRule(predicate, errorMessage));
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
}

export function str(errorMessage: string = "Value is not a string."): StringRules {
    return new StringRules().withRule(StringRules.isStringRule(errorMessage));
}

export function num(errorMessage: string = "Value is not a valid number"): NumberRules {
    return new NumberRules().withRule(NumberRules.isNumberRule(errorMessage));
}