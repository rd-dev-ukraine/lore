/// <reference path="../validator.d.ts" />

import ValidationContext from "../validation-context";


export abstract class ChainableRuleRunner<TOut> implements IValidationRule<any, TOut> {
    rules: ValidateAndTransformFunc<any, TOut>[] = [];

    run(value: any, validationContext: ValidationContext): TOut {
        return this.rules
            .reduce((currentValue, rule) => rule(currentValue, err => validationContext.reportError(err)), value);
    }

    withRule(rule: ValidateAndTransformFunc<any, TOut>): this {
        this.rules.push(rule);
        return this;
    }

    required(errorMessage: string = "Value is required"): this {
        return this.withRule(ChainableRuleRunner.requiredRule(errorMessage));
    }

    static mustRule<TIn, TOut>(predicate: (value: TIn, entity?: any, rootEntity?: any) => boolean, errorMessage: string): ValidateAndTransformFunc<TIn, TOut> {
        return (value, reportError: ReportErrorFunction, entity, rootEntity) => {
            if (!predicate(value, entity, rootEntity)) {
                reportError(errorMessage);
            }

            return value;
        };
    }

    static requiredRule<TIn, TOut>(errorMessage: string): ValidateAndTransformFunc<TIn, TOut> {
        return (value, reportError: ReportErrorFunction) => {
            if (value === null || value === undefined) {
                reportError(errorMessage);
            }

            return value;
        }
    }
}