"use strict";
var should = require("should");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for number array", function () {
        var numberArrayValidator = validator_1.arr(validator_1.num().required().must(function (v) { return v > 0 && v < 10; }));
        it("should pass for valid array", function () {
            var validArray = [1, 2, 4];
            var result = validator_1.validate(validArray, numberArrayValidator);
            result.valid.should.be.true();
            result.value.should.deepEqual(validArray);
        });
        it("should fail for invalid array", function () {
            var invalidArray = [1, 2, "sad"];
            var result = validator_1.validate(invalidArray, numberArrayValidator);
            result.valid.should.be.false();
            result.errors["[2]"][0].should.equal("Value is not a valid number");
        });
        it("should support filtering", function () {
            var numberArrayValidatorWithFilter = validator_1.arr(validator_1.num().required().must(function (v) { return v > 0 && v < 10; })).filterElements(function (v) { return v < 10; });
            var numbers = [1, 2, 10, 20];
            var result = validator_1.validate(numbers, numberArrayValidatorWithFilter);
            result.valid.should.be.true();
            result.value.should.deepEqual([1, 2]);
        });
        it("should use target indexes in error path when fail after filtering", function () {
            var numberArrayValidatorWithFilter = validator_1.arr(validator_1.num().required().must(function (v) { return v > 0 && v < 10; })).filterElements(function (v) { return v < 50; });
            var numbers = [1, 2, 100, 200, 4, 300, 20];
            var result = validator_1.validate(numbers, numberArrayValidatorWithFilter);
            result.valid.should.be.false();
            should(result.value).be.null();
            result.errors["[6]"][0].should.equal("Value is invalid");
        });
    });
};
//# sourceMappingURL=array-validator-test.js.map