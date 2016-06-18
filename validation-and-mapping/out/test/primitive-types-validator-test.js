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
            validator_1.validateWithPromise(213, validator_1.rules.str(false, "Value is not string"))
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
        it("should pass if null string and no required rule", function (done) {
            validator_1.validateWithPromise(null, validator_1.rules.str(false))
                .then(function (v) { return utils_1.assertBlock(done, function () {
                should(v).be.null();
            }); })
                .catch(function (err) {
                done("Validation should not fail.");
            });
        });
        it("should fail if null string and required rule included", function (done) {
            validator_1.validateWithPromise(null, validator_1.rules.str(false).required("NULL!!"))
                .then(function () { return done("Validation must fail."); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err[""]).deepEqual(["NULL!!"]);
            }); });
        });
        it("should pass if null string and required rule included and conversion enabled", function (done) {
            validator_1.validateWithPromise(null, validator_1.rules.str().required("NULL!!"))
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.equal("");
            }); })
                .catch(function () { return done("Validation must pass!"); });
        });
    });
    describe("for number", function () {
        it("should pass on valid number", function (done) {
            var numValue = 233.4;
            validator_1.validateWithPromise(numValue, validator_1.rules.num().must(function (v) { return v > 200 && v < 300; }))
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.equal(numValue);
            }); })
                .catch(function (err) { return done("Validation must pass!"); });
        });
        it("should convert number if value is convertible", function (done) {
            var convertibleValue = "2344.4";
            validator_1.validateWithPromise(convertibleValue, validator_1.rules.num())
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.equal(2344.4);
            }); })
                .catch(function () { return done("Validation must pass and convert a number"); });
        });
        it("should fail number if value is not convertible", function (done) {
            var convertibleValue = "sdffsdf";
            validator_1.validateWithPromise(convertibleValue, validator_1.rules.num(true, "NOT CONVERTIBLE"))
                .then(function (v) { return done(v); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err[""]).deepEqual(["NOT CONVERTIBLE"]);
            }); });
        });
        it("should fail if value is convertible but conversion disabled", function (done) {
            var convertibleValue = "2344.4";
            validator_1.validateWithPromise(convertibleValue, validator_1.rules.num(false, "NOT NUMBER!"))
                .then(function (v) { return done("Must not convert if conversion disabled!"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err[""]).deepEqual(["NOT NUMBER!"]);
            }); });
        });
        // it("should pass if null value and no required rule", () => {
        //     const result = validate(null, num());
        //     result.valid.should.be.true();
        //     should(result.value).be.null();
        // });
        // it("should false if null value and required rule included", () => {
        //     const result = validate(null, num().required());
        //     result.valid.should.be.false();
        //     should(result.value).be.null();
        // });
    });
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