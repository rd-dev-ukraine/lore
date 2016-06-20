import { ValidationRule, IValidationContext, RuleOptions } from "../definitions";
export declare function ensureRuleOptions(options: RuleOptions, defaultRuleOptions: RuleOptions): RuleOptions;
/**
 * Combines rules array into single rule which runs all rules.
 * Parsing stage is run for all rules one by one using previous rule result as input for next rule.
 * Validation stage is run for all rules sequentially but stops if rule with stopOnFailure = true is failed.
 */
export declare function combineRules<T>(...rules: ValidationRule<T>[]): ValidationRule<T>;
/**
 * Base class which can contain a set of rules which runs sequentially,
 * accumulates errors.
 * Each next rule validates conversion result of previous rule if successful or last successful value or input.
 */
export declare abstract class SequentialRuleSet<T> implements ValidationRule<T> {
    private rules;
    stopOnFailure: boolean;
    /** Runs parsing on all rules. */
    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T;
    /** Runs all chained rules. */
    runValidate(context: IValidationContext, doneCallback: (success: boolean) => void, parsedValue: any, validatingObject?: any, rootObject?: any): void;
    /**
     * Adds a rule which uses custom functions for validation and converting.
     * If parsing function is not provided value is passed to validation function without conversion.
     */
    checkAndConvert(validationFn: (doneCallback: (errorMessage?: string) => void, parsedValue: T, validatingObject?: any, rootObject?: any) => void, parseFn?: (inputValue: any, validatingObject?: any, rootObject?: any) => T, putRuleFirst?: boolean, stopOnFailure?: boolean): this;
    /** Fails if input value is null or undefined. */
    required(options?: RuleOptions): this;
    /**
     * Parses input value.
     * Parse rules runs first.
     * If transformation function returns null or undefined or throws an error fails with specified error message.
     */
    parse(convertFn: (inputValue: any, validatingObject?: any, rootObject?: any) => T, options?: RuleOptions): this;
    must(predicate: (value: T, validatingObject?: any, rootObject?: any) => boolean, options?: RuleOptions): this;
    protected withRule(rule: ValidationRule<T>, putRuleFirst?: boolean): this;
    protected abstract clone(): SequentialRuleSet<T>;
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
export declare abstract class EnclosingValidationRuleBase<T> implements ValidationRule<T> {
    protected rule: ValidationRule<T>;
    private rulesBefore;
    private rulesAfter;
    stopOnFailure: boolean;
    constructor(rule: ValidationRule<T>);
    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T;
    runValidate(context: IValidationContext, doneCallback: (success: boolean) => void, obj: any, validatingObject?: any, rootObject?: any): void;
    stopOnFail(stopOnFailure?: boolean): this;
    /** Disables null object. */
    required(options?: RuleOptions): this;
    /** Adds a rule which is run before validation. */
    runBefore(rule: ValidationRule<T>): this;
    /** Adds a rule which is run after validation. */
    runAfter(rule: ValidationRule<T>): this;
    before(predicate: (obj: T, validatingObject?: any, rootObject?: any) => boolean, options?: RuleOptions): this;
    after(predicate: (obj: T, validatingObject?: any, rootObject?: any) => boolean, options?: RuleOptions): this;
    protected withMainRule(rule: ValidationRule<T>): this;
    protected abstract clone(): this;
    private copy();
}
export declare class EmptyRule<T> implements ValidationRule<T> {
    stopOnFailure: boolean;
    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T;
    /** Runs all chained rules. */
    runValidate(context: IValidationContext, doneCallback: (success: boolean) => void, parsedValue: any, validatingObject?: any, rootObject?: any): void;
}
export declare class AnyRules<T> extends SequentialRuleSet<T> {
    constructor(stopOnFailure: boolean);
    protected clone(): AnyRules<T>;
}
/** Validates any value using given predicate. */
export declare function any<T>(predicate?: (value: T, entity?: any, rootEntity?: any) => boolean, options?: RuleOptions): AnyRules<T>;
