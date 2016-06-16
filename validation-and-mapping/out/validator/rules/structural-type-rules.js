"use strict";
var ObjectValidationRule = (function () {
    function ObjectValidationRule(struct, passNullObject, nullObjectErrorMessage) {
        this.struct = struct;
        this.passNullObject = passNullObject;
        this.nullObjectErrorMessage = nullObjectErrorMessage;
        if (!struct)
            throw new Error("object structure descriptor is required");
        if (!passNullObject && !nullObjectErrorMessage)
            throw new Error("Validation message for null object required");
    }
    ObjectValidationRule.prototype.run = function (value, validationContext, entity, root) {
        if (value === null || value === undefined) {
            if (!this.passNullObject)
                validationContext.reportError(this.nullObjectErrorMessage);
            return value;
        }
        var result = {};
        for (var property in this.struct) {
            var rule = this.struct[property];
            var inputValue = value[property];
            var nestedContext = validationContext.property(property);
            result[property] = rule.run(inputValue, nestedContext, value, root);
        }
        return result;
    };
    return ObjectValidationRule;
}());
/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be omitted from the result.
 */
function obj(struct, nullObjectErrorMessage) {
    if (nullObjectErrorMessage === void 0) { nullObjectErrorMessage = "Object required"; }
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule(struct, false, nullObjectErrorMessage);
}
exports.obj = obj;
function objOptional(struct) {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule(struct, true);
}
exports.objOptional = objOptional;
//# sourceMappingURL=structural-type-rules.js.map