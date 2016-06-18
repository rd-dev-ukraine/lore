import { ValidationRule, IValidationContext } from "../definitions";


/**
 * Base class which can contain a set of rules which runs sequentially, 
 * accumulates errors. 
 * Each next rule validates conversion result of previous rule if successful or last successful value or input. 
 */
export abstract class SequentialRuleSet<T> implements ValidationRule<T> {
    private rules: ValidationRule<T>[] = [];
    private stopOnFirstFailureValue = false;

    protected abstract clone(): SequentialRuleSet<T>;

    /** Runs parsing on all rules. */
    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T {
        return this.rules
            .reduce((currentValue, rule) => rule.runParse(currentValue, validatingObject, rootObject), inputValue);
    }

    /** Runs all chained rules. */
    runValidate(context: IValidationContext,
        doneCallback: (success: boolean) => void,
        parsedValue: any,
        validatingObject?: any,
        rootObject?: any): void {
        if (!context) {
            throw new Error("context is required.");
        }
        if (!doneCallback) {
            throw new Error("done callback is required.");
        }

        let allRulesValid = true;
        const rulesToRun = [...this.rules];

        const runRule = () => {
            const rule = rulesToRun.shift();
            if (rule) {
                rule.runValidate(
                    context,
                    (success) => {
                        if (!success && this.stopOnFirstFailureValue) {
                            doneCallback(false);
                            return;
                        }

                        allRulesValid = allRulesValid && success;

                        // Runs next rule recursively
                        runRule();
                    },
                    parsedValue,
                    validatingObject,
                    rootObject);
            }
            else {
                doneCallback(allRulesValid);
            }
        };

        runRule();
    }

    protected withRule(rule: ValidationRule<T>, putRuleFirst: boolean = false): this {
        if (!rule) {
            throw new Error("rule is required");
        }

        const copy = this.clone();

        copy.stopOnFirstFailureValue = this.stopOnFirstFailureValue;

        if (putRuleFirst) {
            copy.rules = [rule, ...this.rules];
        }
        else {
            copy.rules = [...this.rules, rule];
        }

        return <this>copy;
    }

    /** 
     * Adds a rule which uses custom functions for validation and converting. 
     * If parsing function is not provided value is passed to validation function without conversion. 
     */
    checkAndConvert(
        validationFn: (doneCallback: (errorMessage?: string) => void, parsedValue: T, validatingObject?: any, rootObject?: any) => void,
        parseFn?: (inputValue: any, validatingObject?: any, rootObject?: any) => T,
        putRuleFirst: boolean = false) {

        if (!validationFn) {
            throw new Error("Validation function is required.");
        }

        parseFn = (parseFn || (input => input));

        return this.withRule(
            {

                runParse: parseFn,

                runValidate(
                    context: IValidationContext,
                    done: (success: boolean) => void,
                    inputValue: any,
                    validatingObject?: any,
                    rootObject?: any): void {

                    validationFn(
                        (errorMessage) => {
                            if (errorMessage) {
                                context.reportError(errorMessage);
                                done(false);
                            }
                            else {
                                done(true);
                            }
                        },
                        inputValue,
                        validatingObject,
                        rootObject);
                }
            },
            putRuleFirst);
    }

    /** Fails if input value is null or undefined. */
    required(errorMessage: string = "Value is required."): this {
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.checkAndConvert(
            (done, input) => {
                if (input === null || input === undefined) {
                    done(errorMessage);
                }
                else {
                    done();
                }
            },
            null,
            true);
    }

    /** 
     * Parses input value.
     * Parse rules runs first.
     * If transformation function returns null or undefined or throws an error fails with specified error message.
     */
    parse(convertFn: (inputValue: any, validatingObject?: any, rootObject?: any) => T, errorMessage: string = "Conversion failed"): this {
        if (!convertFn) {
            throw new Error("Transformation function is required.")
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
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
                try {
                    const converted = convertFn(inputValue, validatingObject, rootObject);
                    if (converted === null || converted === undefined) {
                        return <T><any>failResult;
                    }

                    return converted;
                }
                catch (e) {
                    return <T><any>failResult;
                }
            });
    }

    must(predicate: (value: any, validatingObject?: any, rootObject?: any) => boolean, errorMessage: string = "Value is invalid"): this {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.checkAndConvert((done, input, obj, root) => {
            if (!predicate(input, obj, root)) {
                done(errorMessage);
            }
            else {
                done();
            }
        })
    }
}

/** 
 * Encapsulates rule enclosed in set of rules run before and after the rule.
 * 
 * Parsing only run for main rule. All other rules uses main rule parsing result as input.
 * 
 * The main rule is run only if all rules run before has been run successfuly.
 * The rules to run after would be only run if main rule run successfuly.
 * 
 * Enclosing rule would be run successfuly only if all rules (before, main and after) has run successfuly.  
 */
export abstract class EnclosingValidationRuleBase<T> implements ValidationRule<T> {
    private rulesBefore: ValidationRule<T>[] = [];
    private rulesAfter: ValidationRule<T>[] = [];

    constructor(protected rule: ValidationRule<T>) {
        if (!rule) {
            throw new Error("Validation rule is required.");
        }
    }

    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T {
        return this.rule.runParse(inputValue, validatingObject, rootObject);
    }

    runValidate(
        context: IValidationContext,
        doneCallback: (success: boolean) => void,
        obj: any,
        validatingObject?: any,
        rootObject?: any): void {

        const all = [
            ...(this.rulesBefore || []),
            this.rule,
            ...(this.rulesAfter || [])
        ];

        this.runRuleSet(
            all,
            context,
            doneCallback,
            obj,
            validatingObject,
            rootObject
        );
    }

    private runRuleSet(
        rules: ValidationRule<T>[],
        context: IValidationContext,
        doneCallback: (success: boolean) => void,
        obj: any,
        validatingObject?: any,
        rootObject?: any) {

        const rulesToRun = [...rules];

        const run = () => {
            const rule = rulesToRun.shift();
            if (rule) {
                rule.runValidate(
                    context,
                    success => {
                        if (!success) {
                            doneCallback(false);
                            return;
                        }

                        run();
                    },
                    obj,
                    validatingObject,
                    rootObject
                );
            }
            else {
                doneCallback(true);
            }

        };

        run();
    }

    protected abstract clone(): this;

    private copy(): this {
        const result = this.clone();

        result.rulesBefore = [...this.rulesBefore];
        result.rulesAfter = [...this.rulesAfter];

        return result;
    }

    /** Disables null object. */
    required(errorMessage = "Object is required."): this {
        if (!errorMessage) {
            throw new Error("Error message is required");
        }

        const result = this.copy();

        result.rulesBefore = [
            any<T>(v => v !== null && v !== undefined, errorMessage),
            ...result.rulesBefore];

        return result;
    }

    /** Adds a rule which is run before validation. */
    runBefore(rule: ValidationRule<T>): this {
        if (!rule) {
            throw new Error("rule is required");
        }

        const result = this.copy();
        result.rulesBefore = [...this.rulesBefore, rule];

        return result;
    }

    /** Adds a rule which is run after validation. */
    runAfter(rule: ValidationRule<T>): this {
        if (!rule) {
            throw new Error("rule is required");
        }

        const result = this.copy();
        result.rulesAfter = [...this.rulesAfter, rule];

        return result;
    }


    before(predicate: (obj: T, validatingObject?: any, rootObject?: any) => boolean, errorMessage = "Object is not valid."): this {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.runBefore(any<T>(predicate, errorMessage));
    }

    after(predicate: (obj: T, validatingObject?: any, rootObject?: any) => boolean, errorMessage = "Object is not valid."): this {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }

        return this.runAfter(any<T>(predicate, errorMessage));
    }
}

export class EmptyRule<T> implements ValidationRule<T> {
    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T {
        return <T>inputValue;
    }

    /** Runs all chained rules. */
    runValidate(context: IValidationContext,
        doneCallback: (success: boolean) => void,
        parsedValue: any,
        validatingObject?: any,
        rootObject?: any): void {
        doneCallback(true);
    }
}

export class AnyRules<T> extends SequentialRuleSet<T> {
    protected clone(): AnyRules<T> {
        return new AnyRules<T>();
    }
}

/** Validates any value using given predicate. */
export function any<T>(predicate?: (value: T, entity?: any, rootEntity?: any) => boolean, errorMessage: string = "Value is invalid"): AnyRules<T> {
    if (!errorMessage) {
        throw new Error("Error message is required");
    }

    predicate = predicate || (v => true);
    return new AnyRules<T>().must(predicate, errorMessage);
}