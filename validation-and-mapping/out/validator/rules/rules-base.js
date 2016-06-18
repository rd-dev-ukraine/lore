"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Base class which can contain a set of rules which runs sequentially,
 * accumulates errors.
 * Each next rule validates conversion result of previous rule if successful or last successful value or input.
 */
var SequentialRuleSet = (function () {
    function SequentialRuleSet() {
        this.rules = [];
        this.stopOnFirstFailureValue = false;
    }
    /** Runs parsing on all rules. */
    SequentialRuleSet.prototype.runParse = function (inputValue, validatingObject, rootObject) {
        return this.rules
            .reduce(function (currentValue, rule) { return rule.runParse(currentValue, validatingObject, rootObject); }, inputValue);
    };
    /** Runs all chained rules. */
    SequentialRuleSet.prototype.runValidate = function (context, doneCallback, parsedValue, validatingObject, rootObject) {
        var _this = this;
        if (!context) {
            throw new Error("context is required.");
        }
        if (!doneCallback) {
            throw new Error("done callback is required.");
        }
        var allRulesValid = true;
        var rulesToRun = this.rules.slice();
        var runRule = function () {
            var rule = rulesToRun.shift();
            if (rule) {
                rule.runValidate(context, function (success) {
                    if (!success && _this.stopOnFirstFailureValue) {
                        doneCallback(false);
                        return;
                    }
                    allRulesValid = allRulesValid && success;
                    // Runs next rule recursively
                    runRule();
                }, parsedValue, validatingObject, rootObject);
            }
            else {
                doneCallback(allRulesValid);
            }
        };
        runRule();
    };
    SequentialRuleSet.prototype.withRule = function (rule, putRuleFirst) {
        if (putRuleFirst === void 0) { putRuleFirst = false; }
        if (!rule) {
            throw new Error("rule is required");
        }
        var copy = this.clone();
        copy.stopOnFirstFailureValue = this.stopOnFirstFailureValue;
        if (putRuleFirst) {
            copy.rules = [rule].concat(this.rules);
        }
        else {
            copy.rules = this.rules.concat([rule]);
        }
        return copy;
    };
    /**
     * Adds a rule which uses custom functions for validation and converting.
     * If parsing function is not provided value is passed to validation function without conversion.
     */
    SequentialRuleSet.prototype.checkAndConvert = function (validationFn, parseFn, putRuleFirst) {
        if (putRuleFirst === void 0) { putRuleFirst = false; }
        if (!validationFn) {
            throw new Error("Validation function is required.");
        }
        parseFn = (parseFn || (function (input) { return input; }));
        return this.withRule({
            runParse: parseFn,
            runValidate: function (context, done, inputValue, validatingObject, rootObject) {
                validationFn(function (errorMessage) {
                    if (errorMessage) {
                        context.reportError(errorMessage);
                        done(false);
                    }
                    else {
                        done(true);
                    }
                }, inputValue, validatingObject, rootObject);
            }
        }, putRuleFirst);
    };
    /** Fails if input value is null or undefined. */
    SequentialRuleSet.prototype.required = function (errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is required."; }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.checkAndConvert(function (done, input) {
            if (input === null || input === undefined) {
                done(errorMessage);
            }
            else {
                done();
            }
        }, null, true);
    };
    /**
     * Parses input value.
     * Parse rules runs first.
     * If transformation function returns null or undefined or throws an error fails with specified error message.
     */
    SequentialRuleSet.prototype.parse = function (convertFn, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Conversion failed"; }
        if (!convertFn) {
            throw new Error("Transformation function is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        var failResult = new Object();
        return this.checkAndConvert(function (done, convertedValue, obj, root) {
            if (convertedValue === failResult) {
                done(errorMessage);
            }
            else {
                done(null);
            }
        }, function (inputValue, validatingObject, rootObject) {
            try {
                var converted = convertFn(inputValue, validatingObject, rootObject);
                if (converted === null || converted === undefined) {
                    return failResult;
                }
                return converted;
            }
            catch (e) {
                return failResult;
            }
        });
    };
    SequentialRuleSet.prototype.must = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is invalid"; }
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.checkAndConvert(function (done, input, obj, root) {
            if (!predicate(input, obj, root)) {
                done(errorMessage);
            }
            else {
                done();
            }
        });
    };
    return SequentialRuleSet;
}());
exports.SequentialRuleSet = SequentialRuleSet;
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
var EnclosingValidationRuleBase = (function () {
    function EnclosingValidationRuleBase(rule) {
        this.rule = rule;
        this.rulesBefore = [];
        this.rulesAfter = [];
        if (!rule) {
            throw new Error("Validation rule is required.");
        }
    }
    EnclosingValidationRuleBase.prototype.runParse = function (inputValue, validatingObject, rootObject) {
        return this.rule.runParse(inputValue, validatingObject, rootObject);
    };
    EnclosingValidationRuleBase.prototype.runValidate = function (context, doneCallback, obj, validatingObject, rootObject) {
        var all = (this.rulesBefore || []).concat([
            this.rule
        ], (this.rulesAfter || []));
        this.runRuleSet(all, context, doneCallback, obj, validatingObject, rootObject);
    };
    EnclosingValidationRuleBase.prototype.runRuleSet = function (rules, context, doneCallback, obj, validatingObject, rootObject) {
        var rulesToRun = rules.slice();
        var run = function () {
            var rule = rulesToRun.shift();
            if (rule) {
                rule.runValidate(context, function (success) {
                    if (!success) {
                        doneCallback(false);
                        return;
                    }
                    run();
                }, obj, validatingObject, rootObject);
            }
            else {
                doneCallback(true);
            }
        };
        run();
    };
    EnclosingValidationRuleBase.prototype.copy = function () {
        var result = this.clone();
        result.rulesBefore = this.rulesBefore.slice();
        result.rulesAfter = this.rulesAfter.slice();
        return result;
    };
    /** Disables null object. */
    EnclosingValidationRuleBase.prototype.required = function (errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Object is required."; }
        if (!errorMessage) {
            throw new Error("Error message is required");
        }
        var result = this.copy();
        result.rulesBefore = [
            any(function (v) { return v !== null && v !== undefined; }, errorMessage)
        ].concat(result.rulesBefore);
        return result;
    };
    /** Adds a rule which is run before validation. */
    EnclosingValidationRuleBase.prototype.runBefore = function (rule) {
        if (!rule) {
            throw new Error("rule is required");
        }
        var result = this.copy();
        result.rulesBefore = this.rulesBefore.concat([rule]);
        return result;
    };
    /** Adds a rule which is run after validation. */
    EnclosingValidationRuleBase.prototype.runAfter = function (rule) {
        if (!rule) {
            throw new Error("rule is required");
        }
        var result = this.copy();
        result.rulesAfter = this.rulesAfter.concat([rule]);
        return result;
    };
    EnclosingValidationRuleBase.prototype.before = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Object is not valid."; }
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.runBefore(any(predicate, errorMessage));
    };
    EnclosingValidationRuleBase.prototype.after = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Object is not valid."; }
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.runAfter(any(predicate, errorMessage));
    };
    return EnclosingValidationRuleBase;
}());
exports.EnclosingValidationRuleBase = EnclosingValidationRuleBase;
var EmptyRule = (function () {
    function EmptyRule() {
    }
    EmptyRule.prototype.runParse = function (inputValue, validatingObject, rootObject) {
        return inputValue;
    };
    /** Runs all chained rules. */
    EmptyRule.prototype.runValidate = function (context, doneCallback, parsedValue, validatingObject, rootObject) {
        doneCallback(true);
    };
    return EmptyRule;
}());
exports.EmptyRule = EmptyRule;
var AnyRules = (function (_super) {
    __extends(AnyRules, _super);
    function AnyRules() {
        _super.apply(this, arguments);
    }
    AnyRules.prototype.clone = function () {
        return new AnyRules();
    };
    return AnyRules;
}(SequentialRuleSet));
exports.AnyRules = AnyRules;
/** Validates any value using given predicate. */
function any(predicate, errorMessage) {
    if (errorMessage === void 0) { errorMessage = "Value is invalid"; }
    if (!errorMessage) {
        throw new Error("Error message is required");
    }
    predicate = predicate || (function (v) { return true; });
    return new AnyRules().must(predicate, errorMessage);
}
exports.any = any;
//# sourceMappingURL=rules-base.js.map