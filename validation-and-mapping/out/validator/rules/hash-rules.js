/// <reference path="../validator.d.ts" />
"use strict";
var HashValidationRule = (function () {
    function HashValidationRule(elementValidationRule, passNullObject, nullObjectErrorMessage) {
        this.elementValidationRule = elementValidationRule;
        this.passNullObject = passNullObject;
        this.nullObjectErrorMessage = nullObjectErrorMessage;
        if (!elementValidationRule)
            throw new Error("Element validation rule required");
        if (!passNullObject && !nullObjectErrorMessage)
            throw new Error("Validation message for null object required");
    }
    HashValidationRule.prototype.run = function (value, validationContext, entity, root) {
        if (value === null || value === undefined) {
            if (!this.passNullObject)
                validationContext.reportError(this.nullObjectErrorMessage);
            return value;
        }
        var result = {};
        for (var key in value) {
            if (this.keyFilteringFunction && !this.keyFilteringFunction(key))
                continue;
            var nestedValidationContext = validationContext.property(key);
            result[key] = this.elementValidationRule.run(value[key], nestedValidationContext, value, root);
        }
        return result;
    };
    HashValidationRule.prototype.filterKeys = function (predicate) {
        this.keyFilteringFunction = predicate;
        return this;
    };
    return HashValidationRule;
}());
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