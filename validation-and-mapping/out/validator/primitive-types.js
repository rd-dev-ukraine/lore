"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ChainableRuleRunner = (function () {
    function ChainableRuleRunner(rules) {
        this.rules = rules;
    }
    ChainableRuleRunner.prototype.run = function (value, validationContext) {
        return this.rules
            .reduce(function (currentValue, rule) { return rule(currentValue, function (err) { return validationContext.reportError(err); }); }, value);
    };
    return ChainableRuleRunner;
}());
var StringRules = (function (_super) {
    __extends(StringRules, _super);
    function StringRules(rules) {
        _super.call(this, rules);
    }
    StringRules.prototype.notEmpty = function (errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value can not be empty"; }
        return new StringRules([StringRules.notEmtpyRule(errorMessage)].concat(this.rules));
    };
    StringRules.isStringRule = function (errorMessage) {
        return function (value, reportError) {
            if (value === null || value === undefined)
                return value;
            if (typeof value !== "string")
                reportError(errorMessage);
            return value;
        };
    };
    StringRules.notEmtpyRule = function (errorMessage) {
        return function (value, reportError) {
            if (!value || !value.trim())
                reportError(errorMessage);
            return value;
        };
    };
    return StringRules;
}(ChainableRuleRunner));
var NumberRules = (function (_super) {
    __extends(NumberRules, _super);
    function NumberRules(rules) {
        _super.call(this, rules);
    }
    NumberRules.prototype.must = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is invalid"; }
        return new NumberRules(this.rules.concat([NumberRules.mustRule(predicate, errorMessage)]));
    };
    NumberRules.isNumberRule = function (errorMessage) {
        return function (value, reportError) {
            if (value === null || value === undefined)
                return value;
            if (typeof value !== "number") {
                reportError(errorMessage);
                return parseFloat("" + value);
            }
            return value;
        };
    };
    NumberRules.mustRule = function (predicate, errorMessage) {
        return function (value, reportError, entity, rootEntity) {
            if (!predicate(value, entity, rootEntity)) {
                reportError(errorMessage);
            }
            return value;
        };
    };
    return NumberRules;
}(ChainableRuleRunner));
function str(errorMessage) {
    if (errorMessage === void 0) { errorMessage = "Value is not a string."; }
    return new StringRules([StringRules.isStringRule(errorMessage)]);
}
exports.str = str;
function num(errorMessage) {
    if (errorMessage === void 0) { errorMessage = "Value is not a valid number"; }
    return new NumberRules([NumberRules.isNumberRule(errorMessage)]);
}
exports.num = num;
//# sourceMappingURL=primitive-types.js.map