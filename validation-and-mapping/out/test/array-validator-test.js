"use strict";
var should = require("should");
var utils_1 = require("./utils");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for number array", function () {
        var numberArrayValidator = validator_1.rules.arr(validator_1.rules.num().required().must(function (v) { return v > 0 && v < 10; }));
        it("should pass for valid array", function (done) {
            var validArray = [1, 2, 4];
            validator_1.validateWithPromise(validArray, numberArrayValidator)
                .then(function (r) { return utils_1.assertBlock(done, function () {
                should(r).deepEqual([1, 2, 4]);
            }); })
                .catch(function (err) { return done("Must not fail but failed with error " + JSON.stringify(err)); });
        });
        it("should fail for invalid array", function (done) {
            var invalidArray = [1, 2, "sad"];
            validator_1.validateWithPromise(invalidArray, numberArrayValidator)
                .then(function (r) { return done("Must fail but passed with result " + JSON.stringify(r)); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "[2]": ["Value is not a valid number."]
                });
            }); });
        });
        it("should support filtering", function (done) {
            var numberArrayValidatorWithFilter = validator_1.rules.arr(validator_1.rules.num().required().must(function (v) { return v > 0 && v < 10; })).filter(function (v) { return v < 10; });
            var numbers = [1, 2, 10, 20];
            validator_1.validateWithPromise(numbers, numberArrayValidatorWithFilter)
                .then(function (r) { return utils_1.assertBlock(done, function () {
                r.should.deepEqual([1, 2]);
            }); })
                .catch(function (err) { return done("Must pass but failed with error " + JSON.stringify(err)); });
        });
        it("should use target indexes in error path when fail after filtering", function (done) {
            var numberArrayValidatorWithFilter = validator_1.rules.arr(validator_1.rules.num().required().must(function (v) { return v > 0 && v < 10; }, { errorMessage: "Too large" })).filter(function (v) { return v < 50; });
            var numbers = [1, 2, 100, 200, 4, 300, 20];
            validator_1.validateWithPromise(numbers, numberArrayValidatorWithFilter)
                .then(function (r) { return done("Must fail but passed with result " + JSON.stringify(r)); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "[6]": ["Too large"]
                });
            }); });
        });
        it("should correctly build path on failed element validator", function (done) {
            var rule = validator_1.rules.arr(validator_1.rules.obj({
                id: validator_1.rules.num().required().must(function (v) { return v < 10; }, { errorMessage: "Too large" }),
                title: validator_1.rules.str()
            }));
            validator_1.validateWithPromise([
                {
                    id: 1,
                    title: "one"
                },
                {
                    id: 10,
                    title: "ten"
                }
            ], rule)
                .then(function (r) { return done("Must fail but passed with result " + JSON.stringify(r)); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "[1].id": ["Too large"]
                });
            }); });
        });
    });
};
//# sourceMappingURL=array-validator-test.js.map