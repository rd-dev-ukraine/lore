"use strict";
var ObjectValidationRule = (function () {
    function ObjectValidationRule(struct) {
        this.struct = struct;
        if (!struct)
            throw new Error("object structure descriptor is required");
    }
    ObjectValidationRule.prototype.run = function (value, validationContext, entity, root) {
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
function obj(struct) {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule(struct);
}
exports.obj = obj;
//# sourceMappingURL=structural-type-rules.js.map