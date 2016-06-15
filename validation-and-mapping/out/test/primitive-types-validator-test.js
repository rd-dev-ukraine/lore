"use strict";
/// <reference path="../validator/validator.d.ts" />
var should = require("should");
var validator_1 = require("../validator/validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for string", function () {
        it("should validate if value is string", function () {
            var result = validator_1.validator.run("213", validator_1.str());
            result.valid.should.be.true();
            should(result.value).be.equal("213");
        });
        it("should error if value is not string", function () {
            var result = validator_1.validator.run(213, validator_1.str());
            result.valid.should.be.false();
            result.errors.should.keys("");
        });
        it("should run chained validators", function () {
            var result = validator_1.validator.run("", validator_1.str().notEmpty());
            result.valid.should.be.false();
            result.errors[""].length.should.equal(1);
        });
        it("should run chained validators successfuly", function () {
            var result = validator_1.validator.run("23234", validator_1.str().notEmpty());
            result.valid.should.be.true();
            result.value.should.equal("23234");
            should(result.errors).be.undefined();
        });
    });
};
//# sourceMappingURL=primitive-types-validator-test.js.map