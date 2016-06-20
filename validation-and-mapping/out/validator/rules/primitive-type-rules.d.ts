import { RuleOptions } from "../definitions";
import { SequentialRuleSet } from "./rules-base";
export declare class StringRules extends SequentialRuleSet<string> {
    protected clone(): this;
    /**
     * Checks if value has string type. Undefined value is passed as correct.
     * This rule is applied automatically, don't add call this method manually.
     */
    isString(options?: RuleOptions): this;
    parseString(options?: RuleOptions): this;
    notEmpty(options?: RuleOptions): this;
    maxLength(maxLength: number, options?: RuleOptions): this;
    minLength(minLength: number, options?: RuleOptions): this;
}
export declare class NumberRules extends SequentialRuleSet<number> {
    protected clone(): NumberRules;
    /**
     * Checks if value is number. Null or undefined values are passed as correct.
     * This rule is applied automatically, don't call it.
     */
    isNumber(options?: RuleOptions): this;
    /**
     * Parses number.
     */
    parseNumber(options?: RuleOptions): this;
}
export declare function str(convert?: boolean, options?: RuleOptions): StringRules;
export declare function num(convert?: boolean, options?: RuleOptions): NumberRules;
