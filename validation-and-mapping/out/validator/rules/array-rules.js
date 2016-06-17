"use strict";
var ArrayValidationRule = (function () {
    function ArrayValidationRule(elementValidator, passNullOrEmptyArray, nullOrEmptyArrayErrorMessage) {
        this.elementValidator = elementValidator;
        this.passNullOrEmptyArray = passNullOrEmptyArray;
        this.nullOrEmptyArrayErrorMessage = nullOrEmptyArrayErrorMessage;
        this.keepOnlyValidElements = false;
        if (!this.passNullOrEmptyArray && !this.nullOrEmptyArrayErrorMessage) {
            throw new Error("Null or empty array error message required is null array is not passed");
        }
    }
    ArrayValidationRule.prototype.run = function (value, validationContext, entity, root) {
        var _this = this;
        if (value === null || value === undefined || value.length === 0) {
            if (!this.passNullOrEmptyArray) {
                validationContext.reportError(this.nullOrEmptyArrayErrorMessage);
            }
            return value;
        }
        var result = [];
        var _loop_1 = function(i) {
            var elem = value[i];
            if (this_1.filter && !this_1.filter(elem, value, root)) {
                return "continue";
            }
            var valid = true;
            var nestedValidationContext = validationContext.index(i, function () {
                valid = false;
                return !_this.keepOnlyValidElements;
            });
            var convertedValue = this_1.elementValidator.run(elem, nestedValidationContext, value, root);
            if (valid || !this_1.keepOnlyValidElements) {
                result.push(convertedValue);
            }
        };
        var this_1 = this;
        for (var i = 0; i < value.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "continue") continue;
        }
        return result;
    };
    ArrayValidationRule.prototype.keepOnlyValid = function (onlyValid) {
        if (onlyValid === void 0) { onlyValid = true; }
        this.keepOnlyValidElements = onlyValid;
        return this;
    };
    ArrayValidationRule.prototype.filterElements = function (predicate) {
        if (!predicate) {
            throw new Error("predicate is required");
        }
        this.filter = predicate;
        return this;
    };
    return ArrayValidationRule;
}());
exports.ArrayValidationRule = ArrayValidationRule;
function arr(elementValidationRule, nullValueErrorMessage) {
    if (nullValueErrorMessage === void 0) { nullValueErrorMessage = "Value is required."; }
    return new ArrayValidationRule(elementValidationRule, true, nullValueErrorMessage);
}
exports.arr = arr;
function arrOptional(elementValidator) {
    return new ArrayValidationRule(elementValidator, false);
}
exports.arrOptional = arrOptional;
//# sourceMappingURL=array-rules.js.map