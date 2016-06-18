"use strict";
var should = require("should");
var utils_1 = require("./utils");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for string", function () {
        it("should validate if value is string", function (done) {
            validator_1.validateWithPromise("213", validator_1.rules.str())
                .then(function (value) { return utils_1.assertBlock(done, function () {
                should(value).be.equal("213");
            }); })
                .catch(function (err) { return done(err); });
        });
        it("should error if value is not string and conversion disabled", function (done) {
            validator_1.validateWithPromise(213, validator_1.rules.str("Value is not string", false))
                .then(function (v) {
                done("Validation must fail");
            })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err[""][0]).be.equal("Value is not string");
            }); });
        });
        it("should be ok if value is not string and conversion enabled", function (done) {
            validator_1.validateWithPromise(213, validator_1.rules.str())
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.be.equal("213");
            }); })
                .catch(function (err) {
                done("Validation must not fail.");
            });
        });
        it("should run chained validators", function (done) {
            validator_1.validateWithPromise("", validator_1.rules.str().notEmpty("Empty string is invalid!"))
                .then(function () {
                done("Validation must faild.");
            })
                .catch(function (errors) { return utils_1.assertBlock(done, function () {
                errors[""][0].should.be.equal("Empty string is invalid!");
            }); });
        });
        // it("should run chained validators successfuly", () => {
        //     const result = validate("23234", str().notEmpty());
        //     result.valid.should.be.true();
        //     result.value.should.equal("23234");
        //     should(result.errors).be.undefined();
        // });
        // it("should pass if null string and no required rule", () => {
        //     const result = validate(null, str());
        //     result.valid.should.be.true();
        //     should(result.value).be.null();
        // });
        // it("should false if null string and required rule included", () => {
        //     const result = validate(null, str().required());
        //     result.valid.should.be.false();
        //     should(result.value).be.null();
        // });
    });
    // describe("for number", () => {
    //     it("should validate if value is number", () => {
    //         const numValue = 233.4;
    //         const validResult = validate(numValue, num().must(v => v > 200 && v < 300));
    //         validResult.valid.should.be.true();
    //         validResult.value.should.equal(numValue);
    //         const convertibleValue = "2344.4";
    //         const validConvertedResult = validate(convertibleValue, num());
    //         validConvertedResult.valid.should.be.true();
    //         validConvertedResult.value.should.equal(2344.4);
    //         const notConvertibleValue = "sdfsdf";
    //         const invalidResult = validate(notConvertibleValue, num());
    //         invalidResult.valid.should.be.false();
    //         should(invalidResult.value).be.null();
    //     });
    //     it("should pass if null value and no required rule", () => {
    //         const result = validate(null, num());
    //         result.valid.should.be.true();
    //         should(result.value).be.null();
    //     });
    //     it("should false if null value and required rule included", () => {
    //         const result = validate(null, num().required());
    //         result.valid.should.be.false();
    //         should(result.value).be.null();
    //     });
    // });
    // describe("with transform", () => {
    //     const numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    //     const transformNumber = num().required().transform(v => numbers[v], "Undefined");
    //     it("should transform valid values", () => {
    //         const result = validate(1, transformNumber);
    //         result.valid.should.be.true();
    //         result.value.should.equal("one");
    //     });
    //     it("should fail on invalid value", () => {
    //         const result = validate(15, transformNumber);
    //         result.valid.should.be.false();
    //         result.errors[""][0].should.equal("Undefined");
    //     })
    // });
    // describe("for any project", () => {
    //     const validator = any(v => new Date(`${v}`) !== undefined, "Invalid date")
    //         .transform(v => new Date(`${v}`));
    //     it("must validate correct date", () => {
    //         const result = validate("2014-11-01", validator);
    //         result.valid.should.be.true();
    //         (<Date>result.value).getTime().should.equal(new Date("2014-11-01").getTime());
    //     });
    // })
};
//# sourceMappingURL=primitive-types-validator-test.js.map