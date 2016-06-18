"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rules_base_1 = require("./rules-base");
var HashValidationRuleCore = (function () {
    function HashValidationRuleCore(elementValidationRule, skipInvalidElements, filterHashFn) {
        this.elementValidationRule = elementValidationRule;
        this.skipInvalidElements = skipInvalidElements;
        this.filterHashFn = filterHashFn;
        if (!elementValidationRule) {
            throw new Error("Element validation rule required");
        }
    }
    HashValidationRuleCore.prototype.runParse = function (hash, validatingObject, rootObject) {
        if (hash === null || hash === undefined) {
            return hash;
        }
        var result = {};
        for (var key in hash) {
            var inputValue = hash[key];
            var parsedValue = this.elementValidationRule.runParse(inputValue, hash, rootObject);
            if (!this.filterHashFn || this.filterHashFn(key, parsedValue, inputValue)) {
                result[key] = parsedValue;
            }
        }
        return result;
    };
    HashValidationRuleCore.prototype.runValidate = function (context, doneCallback, hash, validatingObject, rootObject) {
        var _this = this;
        var hashKeys = [];
        for (var key in hash) {
            hashKeys.push(hash);
        }
        var valid = true;
        var run = function () {
            if (hashKeys.length) {
                var key_1 = hashKeys.shift();
                var inputValue = hash[key_1];
                var keyContext = context.property(key_1);
                _this.elementValidationRule.runValidate(keyContext, function (success) {
                    if (_this.skipInvalidElements) {
                        if (!success) {
                            delete hash[key_1];
                        }
                    }
                    else {
                        valid = valid && success;
                    }
                    run();
                }, inputValue, hash, rootObject);
            }
            else {
                doneCallback(valid);
            }
        };
        run();
    };
    return HashValidationRuleCore;
}());
var HashValidationRule = (function (_super) {
    __extends(HashValidationRule, _super);
    function HashValidationRule(elementValidationRule, skipInvalidElementsProp, filterHashFn) {
        _super.call(this, new HashValidationRuleCore(elementValidationRule, skipInvalidElementsProp, filterHashFn));
        this.elementValidationRule = elementValidationRule;
        this.skipInvalidElementsProp = skipInvalidElementsProp;
        this.filterHashFn = filterHashFn;
    }
    HashValidationRule.prototype.clone = function () {
        return new HashValidationRule(this.elementValidationRule, this.skipInvalidElementsProp, this.filterHashFn);
    };
    /**
     * Don't fail on invalid element. Instead don't include invalid elements in result hash.
     * Note new rule never fails instead return empty hash.
     */
    HashValidationRule.prototype.skipInvalidElements = function () {
        return new HashValidationRule(this.elementValidationRule, true, this.filterHashFn);
    };
    /** Filter result hash by applying predicate to each hash item and include only items passed the test. */
    HashValidationRule.prototype.filter = function (predicate) {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }
        return new HashValidationRule(this.elementValidationRule, this.skipInvalidElementsProp, predicate);
    };
    return HashValidationRule;
}(rules_base_1.EnclosingValidationRuleBase));
exports.HashValidationRule = HashValidationRule;
/**
 * Validates a map of objects with the same structure.
 */
function hash(elementValidationRule) {
    if (!elementValidationRule) {
        throw new Error("Element validation rule is required.");
    }
    return new HashValidationRule(elementValidationRule, false, null);
}
exports.hash = hash;
//# sourceMappingURL=hash-rules.js.map