"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rules_base_1 = require("./rules-base");
var ArrayValidationRuleCore = (function () {
    function ArrayValidationRuleCore(elementValidationRule, skipInvalidElements, filterElementFn, stopOnFailure) {
        this.elementValidationRule = elementValidationRule;
        this.skipInvalidElements = skipInvalidElements;
        this.filterElementFn = filterElementFn;
        this.stopOnFailure = stopOnFailure;
        if (!elementValidationRule) {
            throw new Error("Element validator is required.");
        }
    }
    ArrayValidationRuleCore.prototype.runParse = function (array, validatingObject, rootObject) {
        var _this = this;
        if (array === null || array === undefined) {
            return array;
        }
        // We don't filter array elements here because we need to keep source indexes in validation context errors.
        return array.map(function (e) { return _this.elementValidationRule.runParse(e, array, rootObject); });
    };
    ArrayValidationRuleCore.prototype.runValidate = function (context, doneCallback, array, validatingObject, rootObject) {
        var _this = this;
        var srcIndex = 0;
        var srcLength = array.length;
        var index = 0;
        var valid = true;
        var run = function () {
            if (srcIndex < srcLength) {
                var element = array[index];
                if (_this.filterElementFn && !_this.filterElementFn(element, srcIndex)) {
                    array.splice(index, 1);
                    srcIndex++;
                    run();
                }
                else {
                    var elementContext_1 = context.index(srcIndex).bufferErrors();
                    _this.elementValidationRule.runValidate(elementContext_1, function (success) {
                        if (_this.skipInvalidElements) {
                            if (!success) {
                                array.splice(index, 1);
                            }
                            else {
                                index++;
                            }
                        }
                        else {
                            elementContext_1.flushErrors();
                            valid = valid && success;
                            index++;
                        }
                        srcIndex++;
                        run();
                    }, element, array, rootObject);
                }
            }
            else {
                doneCallback(valid);
            }
        };
        run();
    };
    return ArrayValidationRuleCore;
}());
exports.ArrayValidationRuleCore = ArrayValidationRuleCore;
var ArrayValidationRule = (function (_super) {
    __extends(ArrayValidationRule, _super);
    function ArrayValidationRule(elementValidationRule, skipInvalidElementsProp, filterElementFn, stopOnMainRuleFailure) {
        _super.call(this, new ArrayValidationRuleCore(elementValidationRule, skipInvalidElementsProp, filterElementFn, stopOnMainRuleFailure));
        this.elementValidationRule = elementValidationRule;
        this.skipInvalidElementsProp = skipInvalidElementsProp;
        this.filterElementFn = filterElementFn;
        this.stopOnMainRuleFailure = stopOnMainRuleFailure;
    }
    ArrayValidationRule.prototype.clone = function () {
        return new ArrayValidationRule(this.elementValidationRule, this.skipInvalidElementsProp, this.filterElementFn, this.stopOnMainRuleFailure);
    };
    /**
     * Don't fail on invalid element. Instead don't include invalid elements in result array.
     * Note new rule never fails instead it returns empty array.
     */
    ArrayValidationRule.prototype.skipInvalidElements = function (skipInvalidElements) {
        if (skipInvalidElements === void 0) { skipInvalidElements = true; }
        this.skipInvalidElementsProp = skipInvalidElements;
        return this.makeCopy();
    };
    /** Filter result array by applying predicate to each hash item and include only items passed the test. */
    ArrayValidationRule.prototype.filter = function (predicate) {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        this.filterElementFn = predicate;
        return this.makeCopy();
    };
    ArrayValidationRule.prototype.makeCopy = function () {
        return this.withMainRule(new ArrayValidationRule(this.elementValidationRule, this.skipInvalidElementsProp, this.filterElementFn, this.stopOnMainRuleFailure));
    };
    return ArrayValidationRule;
}(rules_base_1.EnclosingValidationRuleBase));
exports.ArrayValidationRule = ArrayValidationRule;
/** Validates an array of the elements with the same structure. */
function arr(elementValidationRule, stopOnFailure) {
    if (stopOnFailure === void 0) { stopOnFailure = true; }
    if (!elementValidationRule) {
        throw new Error("Element validation rule is required.");
    }
    return new ArrayValidationRule(elementValidationRule, false, null, stopOnFailure);
}
exports.arr = arr;
//# sourceMappingURL=array-rules.js.map