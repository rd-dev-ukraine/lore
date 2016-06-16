"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ObjectValidationRuleBase = (function () {
    function ObjectValidationRuleBase(struct, passNullObject, nullObjectErrorMessage) {
        this.struct = struct;
        this.passNullObject = passNullObject;
        this.nullObjectErrorMessage = nullObjectErrorMessage;
        this.mustError = "";
        if (!struct)
            throw new Error("object structure descriptor is required");
        if (!passNullObject && !nullObjectErrorMessage)
            throw new Error("Validation message for null object required");
    }
    ObjectValidationRuleBase.prototype.run = function (value, validationContext, entity, root) {
        if (value === null || value === undefined) {
            if (!this.passNullObject)
                validationContext.reportError(this.nullObjectErrorMessage);
            return value;
        }
        if (this.mustPredicate && !this.mustPredicate(value, entity, root)) {
            validationContext.reportError(this.mustError);
        }
        return this.runCore(value, validationContext, entity, root);
    };
    ObjectValidationRuleBase.prototype.must = function (predicate, errorMessage) {
        if (errorMessage === void 0) { errorMessage = "Object data is not valid."; }
        if (!predicate)
            throw new Error("Predicate is requried");
        if (!errorMessage)
            throw new Error("Error message is required");
        this.mustPredicate = predicate;
        this.mustError = errorMessage;
        return this;
    };
    return ObjectValidationRuleBase;
}());
var ObjectValidationRule = (function (_super) {
    __extends(ObjectValidationRule, _super);
    function ObjectValidationRule(struct, passNullObject, nullObjectErrorMessage) {
        _super.call(this, struct, passNullObject, nullObjectErrorMessage);
    }
    ObjectValidationRule.prototype.runCore = function (value, validationContext, entity, root) {
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
}(ObjectValidationRuleBase));
var ExpandableObjectValidationRule = (function (_super) {
    __extends(ExpandableObjectValidationRule, _super);
    function ExpandableObjectValidationRule(struct, passNullObject, nullObjectErrorMessage) {
        _super.call(this, struct, passNullObject, nullObjectErrorMessage);
    }
    ExpandableObjectValidationRule.prototype.runCore = function (value, validationContext, entity, root) {
        var result = {};
        for (var property in value) {
            var rule = this.struct[property];
            if (rule) {
                var inputValue = value[property];
                var nestedContext = validationContext.property(property);
                result[property] = rule.run(inputValue, nestedContext, value, root);
            }
            else {
                result[property] = value[property];
            }
        }
        return result;
    };
    return ExpandableObjectValidationRule;
}(ObjectValidationRuleBase));
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
/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be omitted from the result.
 * This validator doesn't fail on null value.
 */
function objOptional(struct) {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ObjectValidationRule(struct, true);
}
exports.objOptional = objOptional;
/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be preserved as is in result.
 */
function expandableObject(struct, nullObjectErrorMessage) {
    if (nullObjectErrorMessage === void 0) { nullObjectErrorMessage = "Object required"; }
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ExpandableObjectValidationRule(struct, false, nullObjectErrorMessage);
}
exports.expandableObject = expandableObject;
/**
 * Creates a rule which validates given object according to structure.
 * Any extra properties would be preserved as is in result.
 * This validator doesn't fail on null value.
 */
function optionalExpandableObject(struct) {
    if (!struct) {
        throw new Error("Object structure descriptor is required");
    }
    return new ExpandableObjectValidationRule(struct, true);
}
exports.optionalExpandableObject = optionalExpandableObject;
//# sourceMappingURL=object-rules.js.map