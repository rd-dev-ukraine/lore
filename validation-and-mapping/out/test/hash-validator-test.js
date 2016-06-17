"use strict";
var should = require("should");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for numbers hash", function () {
        var numbersHash = validator_1.hash(validator_1.num().required().must(function (n) { return n > 0 && n < 10; }));
        it("must pass valid numbers", function () {
            var validHash = {
                one: 1,
                two: 2,
                three: 3,
                four: 4
            };
            var result = validator_1.validate(validHash, numbersHash);
            result.valid.should.be.true();
            result.value.should.deepEqual(validHash);
        });
        it("must fail on invalid numbers", function () {
            var invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };
            var result = validator_1.validate(invalidHash, numbersHash);
            result.valid.should.be.false();
            should(result.errors["three"][0]).equal("Value is not a valid number");
        });
        it("must not fail and skip invalid if configured", function () {
            var numbersHashWithSkip = validator_1.hash(validator_1.num().required().must(function (n) { return n > 0 && n < 10; })).keepOnlyValid();
            var invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };
            var result = validator_1.validate(invalidHash, numbersHashWithSkip);
            result.valid.should.be.true();
            result.value.should.deepEqual({
                one: 1,
                two: 2
            });
        });
    });
    describe("for objects hash", function () {
        var objectHash = validator_1.hash(validator_1.obj({
            id: validator_1.num().required(),
            title: validator_1.str().required()
        }));
        it("must pass on valid hash", function () {
            var validHash = {
                "1": {
                    id: 1,
                    title: "one"
                },
                "2": {
                    id: 2,
                    title: "two"
                }
            };
            var result = validator_1.validate(validHash, objectHash);
            result.valid.should.be.true();
            result.value.should.deepEqual(validHash);
        });
    });
};
//# sourceMappingURL=hash-validator-test.js.map