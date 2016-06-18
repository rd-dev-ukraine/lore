import { SequentialRuleSet } from "./rules-base";

export class StringRules extends SequentialRuleSet<string> {

    protected clone(): StringRules {
        return new StringRules();
    }

    /** 
     * Checks if value has string type. Undefined value is passed as correct. 
     * This rule is applied automatically, don't add call this method manually.
     */
    isString(errorMessage: string = "Value must be a string."): this {
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.checkAndConvert(
            (done, value) => {
                if (value && typeof value !== "string") {
                    done(errorMessage);
                }
                else {
                    done
                }
            }
        );
    }

    parseString(errorMessage: string = "Value must be a string."): this {
        return this.parse(v => {
            if (v === null || v === undefined || isNaN(v)) {
                return "";
            }

            return "" + v;
        }, errorMessage);
    }

    notEmpty(errorMessage: string = "Value can not be empty."): this {
        return this.checkAndConvert(
            (done, parsedValue) => {
                if (!parsedValue || parsedValue.trim().length === 0) {
                    done(errorMessage);
                }
                else {
                    done();
                }
            });
    }

    maxLength(maxLength: number, errorMessage: string = "Value is too long."): this {
        if (maxLength <= 0) {
            throw new Error("Max length must be greater than zero.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.checkAndConvert(
            (done, value) => {
                if (value && value.length > maxLength) {
                    done(errorMessage);
                }
                else {
                    done();
                }
            }
        );
    }

    minLength(minLength: number, errorMessage: string = "Value is too short."): this {
        if (minLength <= 0) {
            throw new Error("Min length must be greater than zero.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.checkAndConvert(
            (done, value) => {
                if (value && value.length < minLength) {
                    done(errorMessage);
                }
                else {
                    done();
                }
            }
        );
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
                if (value !== null && value !== undefined) {
                    if (typeof value !== "number") {
                        done(errorMessage);
                    }
                }
                else {
                    done();
                }
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

        return this.parse(input => {
            const result = parseFloat(input);
            if (result === null || result === undefined || isNaN(result)) {
                return null;
            }
            else {
                return result;
            }

        }, errorMessage);
    }

}


export function str(errorMessage: string = "Value is not a string.", convert: boolean = true): StringRules {
    if (!errorMessage) {
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
