"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function ensureRuleOptions(options, defaultRuleOptions) {
    options = options || defaultRuleOptions;
    if (!options) {
        throw new Error("Options is required");
    }
    if (defaultRuleOptions.stopOnFailure === null || defaultRuleOptions.stopOnFailure === undefined) {
        defaultRuleOptions.stopOnFailure = false;
    }
    if (options.stopOnFailure === null || options.stopOnFailure === undefined) {
        options.stopOnFailure = defaultRuleOptions.stopOnFailure;
    }
    var result = {
        errorMessage: options.errorMessage || defaultRuleOptions.errorMessage,
        stopOnFailure: options.stopOnFailure
    };
    if (!result.errorMessage) {
        throw new Error("Error message is required.");
    }
    return result;
}
exports.ensureRuleOptions = ensureRuleOptions;
/**
 * Combines rules array into single rule which runs all rules.
 * Parsing stage is run for all rules one by one using previous rule result as input for next rule.
 * Validation stage is run for all rules sequentially but stops if rule with stopOnFailure = true is failed.
 */
function combineRules() {
    var rules = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rules[_i - 0] = arguments[_i];
    }
    rules = rules || [];
    return {
        stopOnFailure: false,
        /** Runs parsing on all rules. */
        runParse: function (inputValue, validatingObject, rootObject) {
            return rules.reduce(function (currentValue, rule) { return rule.runParse(currentValue, validatingObject, rootObject); }, inputValue);
        },
        /** Runs all chained rules. */
        runValidate: function (context, doneCallback, parsedValue, validatingObject, rootObject) {
            if (!context) {
                throw new Error("context is required.");
            }
            if (!doneCallback) {
                throw new Error("done callback is required.");
            }
            var allRulesValid = true;
            var rulesToRun = rules.slice();
            var runRule = function () {
                var rule = rulesToRun.shift();
                if (rule) {
                    rule.runValidate(context, function (success) {
                        if (!success && rule.stopOnFailure) {
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
        }
    };
}
exports.combineRules = combineRules;
/**
 * Base class which can contain a set of rules which runs sequentially,
 * accumulates errors.
 * Each next rule validates conversion result of previous rule if successful or last successful value or input.
 */
var SequentialRuleSet = (function () {
    function SequentialRuleSet() {
        this.rules = [];
        this.stopOnFailure = false;
    }
    /** Runs parsing on all rules. */
    SequentialRuleSet.prototype.runParse = function (inputValue, validatingObject, rootObject) {
        return combineRules.apply(void 0, this.rules).runParse(inputValue, validatingObject, rootObject);
    };
    /** Runs all chained rules. */
    SequentialRuleSet.prototype.runValidate = function (context, doneCallback, parsedValue, validatingObject, rootObject) {
        if (!context) {
            throw new Error("context is required.");
        }
        if (!doneCallback) {
            throw new Error("done callback is required.");
        }
        combineRules.apply(void 0, this.rules).runValidate(context, doneCallback, parsedValue, validatingObject, rootObject);
    };
    /**
     * Adds a rule which uses custom functions for validation and converting.
     * If parsing function is not provided value is passed to validation function without conversion.
     */
    SequentialRuleSet.prototype.checkAndConvert = function (validationFn, parseFn, putRuleFirst, stopOnFailure) {
        if (putRuleFirst === void 0) { putRuleFirst = false; }
        if (stopOnFailure === void 0) { stopOnFailure = false; }
        if (!validationFn) {
            throw new Error("Validation function is required.");
        }
        parseFn = (parseFn || (function (input) { return input; }));
        return this.withRule({
            stopOnFailure: stopOnFailure,
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
    SequentialRuleSet.prototype.required = function (options) {
        options = ensureRuleOptions(options, { errorMessage: "Value is required.", stopOnFailure: true });
        return this.checkAndConvert(function (done, input) {
            if (input === null || input === undefined) {
                done(options.errorMessage);
            }
            else {
                done();
            }
        }, null, true, options.stopOnFailure);
    };
    /**
     * Parses input value.
     * Parse rules runs first.
     * If transformation function returns null or undefined or throws an error fails with specified error message.
     */
    SequentialRuleSet.prototype.parse = function (convertFn, options) {
        if (!convertFn) {
            throw new Error("Transformation function is required.");
        }
        options = ensureRuleOptions(options, {
            errorMessage: "Conversion failed.",
            stopOnFailure: true
        });
        var failResult = new Object();
        return this.checkAndConvert(function (done, convertedValue, obj, root) {
            if (convertedValue == failResult) {
                done(options.errorMessage);
            }
            else {
                done();
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
        }, false, options.stopOnFailure);
    };
    SequentialRuleSet.prototype.must = function (predicate, options) {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        options = ensureRuleOptions(options, {
            errorMessage: "Value is not valid.",
            stopOnFailure: false
        });
        return this.checkAndConvert(function (done, input, obj, root) {
            if (!predicate(input, obj, root)) {
                done(options.errorMessage);
            }
            else {
                done();
            }
        }, null, false, options.stopOnFailure);
    };
    SequentialRuleSet.prototype.withRule = function (rule, putRuleFirst) {
        if (putRuleFirst === void 0) { putRuleFirst = false; }
        if (!rule) {
            throw new Error("rule is required");
        }
        var copy = this.clone();
        copy.stopOnFailure = this.stopOnFailure;
        if (putRuleFirst) {
            copy.rules = [rule].concat(this.rules);
        }
        else {
            copy.rules = this.rules.concat([rule]);
        }
        return copy;
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
        this.stopOnFailure = false;
        if (!rule) {
            throw new Error("Validation rule is required.");
        }
    }
    EnclosingValidationRuleBase.prototype.runParse = function (inputValue, validatingObject, rootObject) {
        return combineRules(this.rule).runParse(inputValue, validatingObject, rootObject);
    };
    EnclosingValidationRuleBase.prototype.runValidate = function (context, doneCallback, obj, validatingObject, rootObject) {
        var all = (this.rulesBefore || []).concat([
            this.rule
        ], (this.rulesAfter || []));
        combineRules.apply(void 0, all).runValidate(context, doneCallback, obj, validatingObject, rootObject);
    };
    EnclosingValidationRuleBase.prototype.stopOnFail = function (stopOnFailure) {
        if (stopOnFailure === void 0) { stopOnFailure = true; }
        var copy = this.clone();
        copy.stopOnFailure = stopOnFailure;
        return copy;
    };
    /** Disables null object. */
    EnclosingValidationRuleBase.prototype.required = function (options) {
        options = ensureRuleOptions(options, {
            errorMessage: "Object is required.",
            stopOnFailure: true
        });
        var result = this.copy();
        result.rulesBefore = [any(function (v) { return v !== null && v !== undefined; }, options)].concat(result.rulesBefore);
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
    EnclosingValidationRuleBase.prototype.before = function (predicate, options) {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        return this.runBefore(any(predicate, options));
    };
    EnclosingValidationRuleBase.prototype.after = function (predicate, options) {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        return this.runAfter(any(predicate, options));
    };
    EnclosingValidationRuleBase.prototype.copy = function () {
        var result = this.clone();
        result.rulesBefore = this.rulesBefore.slice();
        result.rulesAfter = this.rulesAfter.slice();
        result.stopOnFailure = this.stopOnFailure;
        return result;
    };
    return EnclosingValidationRuleBase;
}());
exports.EnclosingValidationRuleBase = EnclosingValidationRuleBase;
var EmptyRule = (function () {
    function EmptyRule() {
        this.stopOnFailure = false;
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
    function AnyRules(stopOnFailure) {
        _super.call(this);
        this.stopOnFailure = stopOnFailure;
    }
    AnyRules.prototype.clone = function () {
        return new AnyRules(this.stopOnFailure);
    };
    return AnyRules;
}(SequentialRuleSet));
exports.AnyRules = AnyRules;
/** Validates any value using given predicate. */
function any(predicate, options) {
    options = ensureRuleOptions(options, {
        stopOnFailure: false
    });
    predicate = predicate || (function (v) { return true; });
    return new AnyRules(options.stopOnFailure).must(predicate, options);
}
exports.any = any;
//# sourceMappingURL=rules-base.js.map