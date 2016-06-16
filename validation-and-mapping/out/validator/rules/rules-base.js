/// <reference path="../validator.d.ts" />
"use strict";
var ChainableRuleRunner = (function () {
    function ChainableRuleRunner() {
        this.rules = [];
    }
    ChainableRuleRunner.prototype.run = function (value, validationContext) {
        return this.rules
            .reduce(function (currentValue, rule) { return rule(currentValue, function (err) { return validationContext.reportError(err); }); }, value);
    };
    ChainableRuleRunner.prototype.withRule = function (rule) {
        this.rules.push(rule);
        return this;
    };
    ChainableRuleRunner.prototype.required = function (errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is required"; }
        return this.withRule(ChainableRuleRunner.requiredRule(errorMessage));
    };
    ChainableRuleRunner.mustRule = function (predicate, errorMessage) {
        return function (value, reportError, entity, rootEntity) {
            if (!predicate(value, entity, rootEntity)) {
                reportError(errorMessage);
            }
            return value;
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