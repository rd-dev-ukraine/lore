"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rules_base_1 = require("./rules-base");
var StringRules = (function (_super) {
    __extends(StringRules, _super);
    function StringRules() {
        _super.apply(this, arguments);
    }
    StringRules.prototype.clone = function () {
        return new StringRules();
    };
    /**
     * Checks if value has string type. Undefined value is passed as correct.
     * This rule is applied automatically, don't add call this method manually.
     */
    StringRules.prototype.isString = function (options) {
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value must be a string.",
            stopOnFailure: true
        });
        return this.checkAndConvert(function (done, value) {
            if (value && typeof value !== "string") {
                done(options.errorMessage);
            }
            else {
                done();
            }
        }, null, true, options.stopOnFailure);
    };
    StringRules.prototype.parseString = function (options) {
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value must be a string.",
            stopOnFailure: true
        });
        return this.parse(function (v) {
            if (!v) {
                return "";
            }
            return "" + v;
        }, options);
    };
    StringRules.prototype.notEmpty = function (options) {
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value can not be empty.",
            stopOnFailure: true
        });
        return this.checkAndConvert(function (done, parsedValue) {
            if (!parsedValue || parsedValue.trim().length === 0) {
                done(options.errorMessage);
            }
            else {
                done();
            }
        }, null, false, options.stopOnFailure);
    };
    StringRules.prototype.maxLength = function (maxLength, options) {
        if (maxLength <= 0) {
            throw new Error("Max length must be greater than zero.");
        }
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value is too long.",
            stopOnFailure: false
        });
        return this.checkAndConvert(function (done, value) {
            if (value && value.length > maxLength) {
                done(options.errorMessage);
            }
            else {
                done();
            }
        }, null, false, options.stopOnFailure);
    };
    StringRules.prototype.minLength = function (minLength, options) {
        if (minLength <= 0) {
            throw new Error("Min length must be greater than zero.");
        }
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value is too short.",
            stopOnFailure: false
        });
        return this.checkAndConvert(function (done, value) {
            if (value && value.length < minLength) {
                done(options.errorMessage);
            }
            else {
                done();
            }
        }, null, false, options.stopOnFailure);
    };
    return StringRules;
}(rules_base_1.SequentialRuleSet));
exports.StringRules = StringRules;
var NumberRules = (function (_super) {
    __extends(NumberRules, _super);
    function NumberRules() {
        _super.apply(this, arguments);
    }
    NumberRules.prototype.clone = function () {
        return new NumberRules();
    };
    /**
     * Checks if value is number. Null or undefined values are passed as correct.
     * This rule is applied automatically, don't call it.
     */
    NumberRules.prototype.isNumber = function (options) {
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value is not valid number.",
            stopOnFailure: true
        });
        return this.checkAndConvert(function (done, value) {
            if (value === null || value === undefined) {
                done();
                return;
            }
            if (typeof value !== "number") {
                done(options.errorMessage);
                return;
            }
            done();
        }, null, true, options.stopOnFailure);
    };
    /**
     * Parses number.
     */
    NumberRules.prototype.parseNumber = function (options) {
        options = rules_base_1.ensureRuleOptions(options, {
            errorMessage: "Value is not valid number.",
            stopOnFailure: false
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
            if (inputValue === null || inputValue === undefined) {
                return inputValue;
            }
            var converted = parseFloat(inputValue);
            if (converted === null || converted === undefined || isNaN(converted)) {
                return failResult;
            }
            return converted;
        }, false, options.stopOnFailure);
    };
    return NumberRules;
}(rules_base_1.SequentialRuleSet));
exports.NumberRules = NumberRules;
function str(convert, options) {
    if (convert === void 0) { convert = true; }
    options = rules_base_1.ensureRuleOptions(options, {
        errorMessage: "Value is not a string.",
        stopOnFailure: true
    });
    if (convert) {
        return new StringRules().parseString(options);
    }
    else {
        return new StringRules().isString(options);
    }
}
exports.str = str;
function num(convert, options) {
    if (convert === void 0) { convert = true; }
    options = rules_base_1.ensureRuleOptions(options, {
        errorMessage: "Value is not a valid number.",
        stopOnFailure: true
    });
    if (convert) {
        return new NumberRules().parseNumber(options);
    }
    else {
        return new NumberRules().isNumber(options);
    }
}
exports.num = num;
//# sourceMappingURL=primitive-type-rules.js.map