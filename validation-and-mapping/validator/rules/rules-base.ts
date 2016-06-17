import { ValidationRule, IValidationContext } from "../definitions";


export abstract class ChainableRuleRunner<T> implements ValidationRule<T> {
    rules: ValidationRule<T>[] = [];

    protected abstract clone(): this;

    /** Runs all chained rules. */
    run(context: IValidationContext,
        done: (convertedValue: T, success: boolean) => void,
        inputValue: any,
        validatingObject?: any,
        rootObject?: any): void {
        if (!context) {
            throw new Error("context is required.");
        }
        if (!done) {
            throw new Error("done callback is required.");
        }

        let allRulesValid = true;
        let value = inputValue;
        const rulesToRun = [...this.rules];

        const runRule = () => {
            const rule = rulesToRun.shift();
            if (rule) {
                rule.run(context,
                    (convertedValue, success) => {
                        if (success) {
                            value = convertedValue;
                        }

                        allRulesValid = allRulesValid && success;

                        // Runs next rule recursively
                        runRule();
                    },
                    value,
                    validatingObject,
                    rootObject);
            }
            else {
                done(value, allRulesValid);
            }
        };

        runRule();
    }

    protected withRule(rule: ValidationRule<T>): this {
        if (!rule) {
            throw new Error("rule is required");
        }

        const copy = this.clone();

        copy.rules = [...this.rules, rule];
        return copy;
    }

    /** Adds a rule which uses custom function for validation and converting. */
    checkAndConvert(fn: (done: (convertedValue: T, errorMessage?: string) => void, inputValue: any, validatingObject?: any, rootObject?: any) => void) {
        if (!fn) {
            throw new Error("Check and convert function is required.");
        }

        return this.withRule({
            run(context: IValidationContext,
                done: (convertedValue: T, success: boolean) => void,
                inputValue: any,
                validatingObject?: any,
                rootObject?: any): void {

                fn((convertedValue, errorMessage) => {
                    if (errorMessage) {
                        context.reportError(errorMessage);
                        done(null, false);
                    }
                    else {
                        done(convertedValue, true);
                    }
                },
                    inputValue,
                    validatingObject,
                    rootObject);
            }
        });
    }

    /** Fails if input value is null or undefined. */
    required(errorMessage: string = "Value is required."): this {
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.checkAndConvert((done, input) => {
            if (input === null || input === undefined) {
                done(null, errorMessage);
            }
            else {
                done(input);
            }
        })
    }

    /** 
     * Converts input value by applying transformation function.
     * If transformation function returns null or undefined or throws an error fails with specified error message.
     */
    transform(transformFn: (value: any, entity?: any, rootEntity?: any) => T, errorMessage: string = "Conversion failed"): this {
        if (!transformFn) {
            throw new Error("Transformation function is required.")
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.checkAndConvert((done, input, obj, root) => {
            try {
                const converted = transformFn(input, obj, root);
                if (converted === null || converted === undefined) {
                    done(null, errorMessage);
                }
                else {
                    done(converted);
                }
            }
            catch (e) {
                done(null, errorMessage);
            };
        });
    }

    must(predicate: (value: any, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.checkAndConvert((done, input, obj, root) => {
            if (!predicate(input, obj, root)) {
                done(null, errorMessage);
            }
            else {
                done(input);
            }
        })
    }
}
