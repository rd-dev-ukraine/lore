"use strict";
var HashValidationRule = (function () {
    function HashValidationRule(elementValidationRule, passNullObject, nullObjectErrorMessage) {
        this.elementValidationRule = elementValidationRule;
        this.passNullObject = passNullObject;
        this.nullObjectErrorMessage = nullObjectErrorMessage;
        this.skipInvalid = false;
        if (!elementValidationRule) {
            throw new Error("Element validation rule required");
        }
        if (!passNullObject && !nullObjectErrorMessage) {
            throw new Error("Validation message for null object required");
        }
    }
    HashValidationRule.prototype.run = function (value, validationContext, entity, root) {
        var _this = this;
        if (value === null || value === undefined) {
            if (!this.passNullObject) {
                validationContext.reportError(this.nullObjectErrorMessage);
            }
            return value;
        }
        if (this.mustPredicate && !this.mustPredicate(value, entity, root)) {
            validationContext.reportError(this.mustErrorMessage);
            return value;
        }
        var result = {};
        var _loop_1 = function(key) {
            if (this_1.keyFilteringFunction && !this_1.keyFilteringFunction(key)) {
                return "continue";
            }
            var valid = true;
            var nestedValidationContext = validationContext.property(key, function () {
                valid = false;
                return !_this.skipInvalid;
            });
            var convertedValue = this_1.elementValidationRule.run(value[key], nestedValidationContext, value, root);
            if (valid || !this_1.skipInvalid) {
                result[key] = convertedValue;
            }
        };
        var this_1 = this;
        for (var key in value) {
            var state_1 = _loop_1(key);
            if (state_1 === "continue") continue;
        }
        return result;
    };
    HashValidationRule.prototype.must = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Value is invalid"; }
        if (!predicate) {
            throw new Error("predicate is required");
        }
        if (!errorMessage) {
            throw new Error("Error message is required");
        }
        this.mustPredicate = predicate;
        this.mustErrorMessage = errorMessage;
        return this;
    };
    HashValidationRule.prototype.filterKeys = function (predicate) {
        this.keyFilteringFunction = predicate;
        return this;
    };
    HashValidationRule.prototype.keepOnlyValid = function (onlyValid) {
        if (onlyValid === void 0) { onlyValid = true; }
        this.skipInvalid = onlyValid;
        return this;
    };
    return HashValidationRule;
}());
exports.HashValidationRule = HashValidationRule;
/**
 * Validates object hash (an object each property of which has the same structure).
 */
function hash(elementValidationRule, nullValueErrorMessage) {
    if (nullValueErrorMessage === void 0) { nullValueErrorMessage = "Object is required."; }
    return new HashValidationRule(elementValidationRule, false, nullValueErrorMessage);
}
exports.hash = hash;
/**
 * Validates object hash (an object each property of which has the same structure).
 */
function hashOptional(elementValidationRule) {
    return new HashValidationRule(elementValidationRule, true);
}
exports.hashOptional = hashOptional;
//# sourceMappingURL=hash-rules.js.map