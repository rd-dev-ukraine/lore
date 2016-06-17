/// <reference path="../validator.d.ts" />
"use strict";
var ChainableRuleRunner = (function () {
    function ChainableRuleRunner() {
        this.rules = [];
    }
    ChainableRuleRunner.prototype.run = function (value, validationContext, entity, root) {
        return this.rules
            .reduce(function (currentValue, rule) { return rule(currentValue, function (err) { return validationContext.reportError(err); }, entity, root); }, value);
    };
    ChainableRuleRunner.prototype.withRule = function (rule) {
        this.rules.push(rule);
        return this;
    };
    ChainableRuleRunner.prototype.required = function (errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is required"; }
        return this.withRule(ChainableRuleRunner.requiredRule(errorMessage));
    };
    ChainableRuleRunner.prototype.transform = function (selector, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Conversion failed"; }
        return this.withRule(ChainableRuleRunner.transformRule(selector, errorMessage));
    };
    ChainableRuleRunner.prototype.must = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is invalid"; }
        return this.withRule(ChainableRuleRunner.mustRule(predicate, errorMessage));
    };
    ChainableRuleRunner.mustRule = function (predicate, errorMessage) {
        return function (value, reportError, entity, rootEntity) {
            if (!predicate(value, entity, rootEntity)) {
                reportError(errorMessage);
            }
            return value;
        };
    };
    ChainableRuleRunner.transformRule = function (selector, errorMessage) {
        return function (value, reportError, entity, rootEntity) {
            try {
                var result = selector(value, entity, rootEntity);
                if (result === null || result === undefined) {
                    reportError(errorMessage);
                }
                return result;
            }
            catch (e) {
                reportError(errorMessage);
            }
            ;
        };
    };
    ChainableRuleRunner.requiredRule = function (errorMessage) {
        return function (value, reportError) {
            if (value === null || value === undefined) {
                reportError(errorMessage);
            }
            return value;
        };
    };
    return ChainableRuleRunner;
}());
exports.ChainableRuleRunner = ChainableRuleRunner;
//# sourceMappingURL=rules-base.js.map