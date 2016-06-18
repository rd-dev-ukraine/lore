"use strict";
var ArrayValidationRuleCore = (function () {
    function ArrayValidationRuleCore(elementValidationRule, skipInvalidElements, filterElementFn) {
        this.elementValidationRule = elementValidationRule;
        this.skipInvalidElements = skipInvalidElements;
        this.filterElementFn = filterElementFn;
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
        var index = 0;
        var valid = true;
        var run = function () {
            if (index < array.length) {
                var element = array[index];
                if (_this.filterElementFn && !_this.filterElementFn(element, srcIndex)) {
                    array.splice(index, 1);
                    srcIndex++;
                }
                else {
                    var elementContext = context.index(srcIndex);
                    _this.elementValidationRule.runValidate(elementContext, function (success) {
                        if (_this.skipInvalidElements) {
                            if (!success) {
                                array.splice(index, 1);
                            }
                        }
                        else {
                            valid = valid && success;
                            index++;
                        }
                        srcIndex++;
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
//# sourceMappingURL=array-rules.js.map