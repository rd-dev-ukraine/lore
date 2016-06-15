/// <reference path="./validator.d.ts" />
import ValidationContext from "./validation-context";
import { IValidationRule } from "./rules";

class StringRules implements IValidationRule<any, string> {

    constructor(private rules: IValidationTransform<any, string>[]) {
    }

    run(value: any, validationContext: ValidationContext): string {
        return this.rules
            .reduce((currentValue, rule) => rule(currentValue, err => validationContext.reportError(err)), value);
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

export function str(errorMessage: string = "Value is not a string."): StringRules {
    return new StringRules([StringRules.isStringRule(errorMessage)]);
}