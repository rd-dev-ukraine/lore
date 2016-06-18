"use strict";
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
    SequentialRuleSet.prototype.parse = function (inputValue, validatingObject, rootObject) {
        return this.rules
            .reduce(function (currentValue, rule) { return rule.parse(currentValue, validatingObject, rootObject); }, inputValue);
    };
    /** Runs all chained rules. */
    SequentialRuleSet.prototype.run = function (context, done, inputValue, validatingObject, rootObject) {
        var _this = this;
        if (!context) {
            throw new Error("context is required.");
        }
        if (!done) {
            throw new Error("done callback is required.");
        }
        var allRulesValid = true;
        var value = inputValue;
        var rulesToRun = this.rules.slice();
        var runRule = function () {
            var rule = rulesToRun.shift();
            if (rule) {
                rule.run(context, function (convertedValue, success) {
                    if (success) {
                        value = convertedValue;
                    }
                    else {
                        if (_this.stopOnFirstFailureValue) {
                            done(value, false);
                            return;
                        }
                    }
                    allRulesValid = allRulesValid && success;
                    // Runs next rule recursively
                    runRule();
                }, value, validatingObject, rootObject);
            }
            else {
                done(value, allRulesValid);
            }
        };
        runRule();
    };
    SequentialRuleSet.prototype.withRule = function (rule) {
        if (!rule) {
            throw new Error("rule is required");
        }
        var copy = this.clone();
        copy.stopOnFirstFailureValue = this.stopOnFirstFailureValue;
        copy.rules = this.rules.concat([rule]);
        return copy;
    };
    /** Adds a rule which uses custom function for validation and converting. */
    SequentialRuleSet.prototype.checkAndConvert = function (fn) {
        if (!fn) {
            throw new Error("Check and convert function is required.");
        }
        return this.withRule({
            run: function (context, done, inputValue, validatingObject, rootObject) {
                fn(function (convertedValue, errorMessage) {
                    if (errorMessage) {
                        context.reportError(errorMessage);
                        done(null, false);
                    }
                    else {
                        done(convertedValue, true);
                    }
                }, inputValue, validatingObject, rootObject);
            }
        });
    };
    /** Fails if input value is null or undefined. */
    SequentialRuleSet.prototype.required = function (errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is required."; }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.checkAndConvert(function (done, input) {
            if (input === null || input === undefined) {
                done(null, errorMessage);
            }
            else {
                done(input);
            }
        });
    };
    /**
     * Converts input value by applying transformation function.
     * If transformation function returns null or undefined or throws an error fails with specified error message.
     */
    SequentialRuleSet.prototype.transform = function (transformFn, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Conversion failed"; }
        if (!transformFn) {
            throw new Error("Transformation function is required.");
        }
        if (!errorMessage) {
            throw new Error("Error message is required.");
        }
        return this.checkAndConvert(function (done, input, obj, root) {
            try {
                var converted = transformFn(input, obj, root);
                if (converted === null || converted === undefined) {
                    done(null, errorMessage);
                }
                else {
                    done(converted);
                }
            }
            catch (e) {
                done(null, errorMessage);
            }
            ;
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
                done(null, errorMessage);
            }
            else {
                done(input);
            }
        });
    };
    return SequentialRuleSet;
}());
exports.SequentialRuleSet = SequentialRuleSet;
//# sourceMappingURL=rules-base.js.map