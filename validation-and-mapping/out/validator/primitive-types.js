"use strict";
var StringRules = (function () {
    function StringRules(rules) {
        this.rules = rules;
    }
    StringRules.prototype.run = function (value, validationContext) {
        return this.rules
            .reduce(function (currentValue, rule) { return rule(currentValue, function (err) { return validationContext.reportError(err); }); }, value);
    };
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
}());
function str(errorMessage) {
    if (errorMessage === void 0) { errorMessage = "Value is not a string."; }
    return new StringRules([StringRules.isStringRule(errorMessage)]);
}
exports.str = str;
//# sourceMappingURL=primitive-types.js.map