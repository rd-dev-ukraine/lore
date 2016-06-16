/// <reference path="../validator.d.ts" />
"use strict";
var ArrayValidationRule = (function () {
    function ArrayValidationRule(elementValidator, passNullOrEmptyArray, nullOrEmptyArrayErrorMessage) {
        this.elementValidator = elementValidator;
        this.passNullOrEmptyArray = passNullOrEmptyArray;
        this.nullOrEmptyArrayErrorMessage = nullOrEmptyArrayErrorMessage;
        this.keepOnlyValidElements = false;
        if (!this.passNullOrEmptyArray && !this.nullOrEmptyArrayErrorMessage)
            throw new Error("Null or empty array error message required is null array is not passed");
    }
    ArrayValidationRule.prototype.run = function (value, validationContext, entity, root) {
        if (value === null || value === undefined || value.length === 0) {
            if (!this.passNullOrEmptyArray)
                validationContext.reportError(this.nullOrEmptyArrayErrorMessage);
            return value;
        }
        var result = [];
        for (var i = 0; i < value.length; i++) {
            var elem = value[i];
            if (this.filter && !this.filter(elem, value, root))
                continue;
        }
    };
    return ArrayValidationRule;
}());
//# sourceMappingURL=array-rules.js.map