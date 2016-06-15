"use strict";
/// <reference path="../validator/validator.d.ts" />
var should = require("should");
var validator_1 = require("../validator/validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for object with flat structure", function () {
        var objectStructure = validator_1.obj({
            id: validator_1.str().required().notEmpty("Empty!!"),
            title: validator_1.str().required().must(function (v) { return v.length < 10; }),
            description: validator_1.str(),
            price: validator_1.num().required().must(function (p) { return p > 0; }, "Positive!!!")
        });
        it("should pass validation for correct structure", function () {
            var test = {
                id: "2342340",
                title: "test",
                price: 23
            };
            var result = validator_1.validator.run(test, objectStructure);
            result.valid.should.be.true();
        });
        it("should not put extra properties in result", function () {
            var test = {
                id: "2342340",
                title: "test",
                price: 23,
                delivery: 233
            };
            var result = validator_1.validator.run(test, objectStructure);
            result.valid.should.be.true();
            should(result["delivery"]).be.undefined();
        });
        it("should fail for invalid property values", function () {
            var test = {
                id: "",
                title: "test",
                price: -23
            };
            var result = validator_1.validator.run(test, objectStructure);
            result.valid.should.be.false();
            Object.keys(result.errors).length.should.equal(2);
            result.errors["id"].length.should.equal(1);
            result.errors["id"][0].should.equal("Empty!!");
            result.errors["price"].length.should.equal(1);
            result.errors["price"][0].should.equal("Positive!!!");
        });
    });
};
//# sourceMappingURL=structural-types-validator-test.js.map