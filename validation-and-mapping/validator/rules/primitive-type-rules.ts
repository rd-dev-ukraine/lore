import { RuleOptions } from "../definitions";
import { SequentialRuleSet, ensureRuleOptions } from "./rules-base";

export class StringRules extends SequentialRuleSet<string> {

    protected clone(): this {
        return <this>new StringRules();
    }

    /** 
     * Checks if value has string type. Undefined value is passed as correct. 
     * This rule is applied automatically, don't add call this method manually.
     */
    isString(options?: RuleOptions): this {
        options = ensureRuleOptions(options, {
            errorMessage: "Value must be a string.",
            stopOnFailure: true
        });

        return this.checkAndConvert(
            (done, value) => {
                if (value && typeof value !== "string") {
                    done(options.errorMessage);
                }
                else {
                    done();
                }
            },
            null,
            true,
            options.stopOnFailure);
    }

    parseString(options?: RuleOptions): this {
        options = ensureRuleOptions(options, {
            errorMessage: "Value must be a string.",
            stopOnFailure: true
        })

        return this.parse(
            v => {
                if (!v) {
                    return "";
                }

                return "" + v;
            },
            options);
    }

    notEmpty(options?: RuleOptions): this {

        options = ensureRuleOptions(options, {
            errorMessage: "Value can not be empty.",
            stopOnFailure: true
        });

        return this.checkAndConvert(
            (done, parsedValue) => {
                if (!parsedValue || parsedValue.trim().length === 0) {
                    done(options.errorMessage);
                }
                else {
                    done();
                }
            },
            null,
            false,
            options.stopOnFailure);
    }

    maxLength(maxLength: number, options?: RuleOptions): this {
        if (maxLength <= 0) {
            throw new Error("Max length must be greater than zero.");
        }
        options = ensureRuleOptions(options, {
            errorMessage: "Value is too long.",
            stopOnFailure: false
        });

        return this.checkAndConvert(
            (done, value) => {
                if (value && value.length > maxLength) {
                    done(options.errorMessage);
                }
                else {
                    done();
                }
            },
            null,
            false,
            options.stopOnFailure);
    }

    minLength(minLength: number, options?: RuleOptions): this {
        if (minLength <= 0) {
            throw new Error("Min length must be greater than zero.");
        }

        options = ensureRuleOptions(options, {
            errorMessage: "Value is too short.",
            stopOnFailure: false
        });

        return this.checkAndConvert(
            (done, value) => {
                if (value && value.length < minLength) {
                    done(options.errorMessage);
                }
                else {
                    done();
                }
            },
            null,
            false,
            options.stopOnFailure);
    }
}

export class NumberRules extends SequentialRuleSet<number> {

    protected clone(): NumberRules {
        return new NumberRules();
    }

    /** 
     * Checks if value is number. Null or undefined values are passed as correct. 
     * This rule is applied automatically, don't call it. 
     */
    isNumber(errorMessage: string = "Value is not valid number"): this {
        if (!errorMessage) {
            throw new Error("Error message is required");
        }

        return this.checkAndConvert(
            (done, value) => {
                if (value === null || value === undefined) {
                    done();
                    return;
                }

                if (typeof value !== "number") {
                    done(errorMessage);
                    return;
                }

                done();
            }
        );
    }

    /**
     * Parses number.
     */
    parseNumber(errorMessage: string = "Value is not valid number."): this {
        if (!errorMessage) {
            throw new Error("Error message is required");
        }

        const failResult = new Object();

        return this.checkAndConvert(
            (done, convertedValue, obj, root) => {
                if (convertedValue == failResult) {
                    done(errorMessage);
                }
                else {
                    done();
                }
            },
            (inputValue, validatingObject, rootObject) => {
                if (inputValue === null || inputValue === undefined) {
                    return inputValue;
                }

                const converted = parseFloat(inputValue);
                if (converted === null || converted === undefined || isNaN(converted)) {
                    return <number><any>failResult;
                }

                return converted;
            });
    }
}


export function str(convert: boolean = true, errorMessage: string = "Value is not a string."): StringRules {
    if (!convert && !errorMessage) {
        throw new Error("Error message is required");
    }

    if (convert) {
        return new StringRules().parseString();
    }
    else {
        return new StringRules().isString(errorMessage);
    }
}

export function num(convert: boolean = true, errorMessage: string = "Value is not a valid number"): NumberRules {
    if (convert) {
        return new NumberRules().parseNumber(errorMessage);
    }
    else {
        return new NumberRules().isNumber(errorMessage);
    }
}
