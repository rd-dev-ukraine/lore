"use strict";
/// <reference path="../validator/validator.d.ts" />
var should = require("should");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for string", function () {
        it("should validate if value is string", function () {
            var result = validator_1.validate("213", validator_1.str());
            result.valid.should.be.true();
            should(result.value).be.equal("213");
        });
        it("should error if value is not string and conversion disabled", function () {
            var result = validator_1.validate(213, validator_1.str("Value is not a valid string", false));
            result.valid.should.be.false();
            result.errors.should.keys("");
        });
        it("should be ok if value is not string and conversion enabled", function () {
            var result = validator_1.validate(213, validator_1.str());
            result.valid.should.be.true();
        });
        it("should run chained validators", function () {
            var result = validator_1.validate("", validator_1.str().notEmpty());
            result.valid.should.be.false();
            result.errors[""].length.should.equal(1);
        });
        it("should run chained validators successfuly", function () {
            var result = validator_1.validate("23234", validator_1.str().notEmpty());
            result.valid.should.be.true();
            result.value.should.equal("23234");
            should(result.errors).be.undefined();
        });
        it("should pass if null string and no required rule", function () {
            var result = validator_1.validate(null, validator_1.str());
            result.valid.should.be.true();
            should(result.value).be.null();
        });
        it("should false if null string and required rule included", function () {
            var result = validator_1.validate(null, validator_1.str().required());
            result.valid.should.be.false();
            should(result.value).be.null();
        });
    });
    describe("for number", function () {
        it("should validate if value is number", function () {
            var numValue = 233.4;
            var validResult = validator_1.validate(numValue, validator_1.num().must(function (v) { return v > 200 && v < 300; }));
            validResult.valid.should.be.true();
            validResult.value.should.equal(numValue);
            var convertibleValue = "2344.4";
            var validConvertedResult = validator_1.validate(convertibleValue, validator_1.num());
            validConvertedResult.valid.should.be.true();
            validConvertedResult.value.should.equal(2344.4);
            var notConvertibleValue = "sdfsdf";
            var invalidResult = validator_1.validate(notConvertibleValue, validator_1.num());
            invalidResult.valid.should.be.false();
            should(invalidResult.value).be.null();
        });
        it("should pass if null value and no required rule", function () {
            var result = validator_1.validate(null, validator_1.num());
            result.valid.should.be.true();
            should(result.value).be.null();
        });
        it("should false if null value and required rule included", function () {
            var result = validator_1.validate(null, validator_1.num().required());
            result.valid.should.be.false();
            should(result.value).be.null();
        });
    });
    describe("with transform", function () {
        var numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
        var transformNumber = validator_1.num().required().transform(function (v) { return numbers[v]; }, "Undefined");
        it("should transform valid values", function () {
            var result = validator_1.validate(1, transformNumber);
            result.valid.should.be.true();
            result.value.should.equal("one");
        });
        it("should fail on invalid value", function () {
            var result = validator_1.validate(15, transformNumber);
            result.valid.should.be.false();
            result.errors[""][0].should.equal("Undefined");
        });
    });
};
//# sourceMappingURL=primitive-types-validator-test.js.map