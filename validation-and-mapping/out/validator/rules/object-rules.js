"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rules_base_1 = require("./rules-base");
var ObjectValidationRuleCore = (function () {
    function ObjectValidationRuleCore(properties, expandable, stopOnFailure) {
        this.properties = properties;
        this.expandable = expandable;
        this.stopOnFailure = stopOnFailure;
        if (!properties) {
            throw new Error("Properties is required.");
        }
    }
    ObjectValidationRuleCore.prototype.runParse = function (obj, validatingObject, rootObject) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        var result = {};
        for (var property in this.properties) {
            var validator = this.properties[property];
            var sourceValue = obj[property];
            var parsedValue = validator.runParse(sourceValue, obj, rootObject);
            result[property] = parsedValue;
        }
        if (this.expandable) {
            for (var property in obj) {
                if (!this.properties[property]) {
                    result[property] = obj[property];
                }
            }
        }
        return result;
    };
    ObjectValidationRuleCore.prototype.runValidate = function (context, doneCallback, obj, validatingObject, rootObject) {
        if (obj === null || obj === undefined) {
            doneCallback(true);
            return;
        }
        var propertyRules = [];
        for (var property in this.properties) {
            var validator = this.properties[property];
            propertyRules.push({
                property: property,
                validator: validator
            });
        }
        var allValid = true;
        var run = function () {
            var rule = propertyRules.shift();
            if (rule) {
                var propertyContext = context.property(rule.property);
                var propertyValue = obj[rule.property];
                rule.validator.runValidate(propertyContext, function (success) {
                    allValid = allValid && success;
                    run();
                }, propertyValue, obj, rootObject);
            }
            else {
                doneCallback(allValid);
            }
        };
        run();
    };
    return ObjectValidationRuleCore;
}());
var ObjectValidationRule = (function (_super) {
    __extends(ObjectValidationRule, _super);
    function ObjectValidationRule(properties, isExpandable, stopsOnMainRuleFailure) {
        _super.call(this, new ObjectValidationRuleCore(properties, isExpandable, stopsOnMainRuleFailure));
        this.properties = properties;
        this.isExpandable = isExpandable;
        this.stopsOnMainRuleFailure = stopsOnMainRuleFailure;
    }
    ObjectValidationRule.prototype.clone = function () {
        return new ObjectValidationRule(this.properties, this.isExpandable, this.stopsOnMainRuleFailure);
    };
    ObjectValidationRule.prototype.expandable = function () {
        this.isExpandable = true;
        return this.makeCopy();
    };
    ObjectValidationRule.prototype.makeCopy = function () {
        return this.withMainRule(new ObjectValidationRule(this.properties, this.isExpandable, this.stopsOnMainRuleFailure));
    };
    return ObjectValidationRule;
}(rules_base_1.EnclosingValidationRuleBase));
exports.ObjectValidationRule = ObjectValidationRule;
function obj(properties, stopOnFailure) {
    if (stopOnFailure === void 0) { stopOnFailure = true; }
    return new ObjectValidationRule(properties, false, stopOnFailure);
}
exports.obj = obj;
//# sourceMappingURL=object-rules.js.map