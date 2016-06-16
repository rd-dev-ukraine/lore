"use strict";
/// <reference path="../validator/validator.d.ts" />
var should = require("should");
var validator_1 = require("../validator");
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
            var result = validator_1.validate(test, objectStructure);
            result.valid.should.be.true();
        });
        it("should not put extra properties in result", function () {
            var test = {
                id: "2342340",
                title: "test",
                price: 23,
                delivery: 233
            };
            var result = validator_1.validate(test, objectStructure);
            result.valid.should.be.true();
            should(result["delivery"]).be.undefined();
        });
        it("should fail for invalid property values", function () {
            var test = {
                id: "",
                title: "test",
                price: -23
            };
            var result = validator_1.validate(test, objectStructure);
            result.valid.should.be.false();
            Object.keys(result.errors).length.should.equal(2);
            result.errors["id"].length.should.equal(1);
            result.errors["id"][0].should.equal("Empty!!");
            result.errors["price"].length.should.equal(1);
            result.errors["price"][0].should.equal("Positive!!!");
        });
    });
    describe("for any object", function () {
        it("should support .must() validation rule", function () {
            var struct = validator_1.obj({
                id: validator_1.num().required(),
                price: validator_1.num().required(),
                retailPrice: validator_1.num().required()
            }).must(function (v) { return v["price"] < v["retailPrice"]; }, "Price is not profitable");
            var result = validator_1.validate({
                id: 10,
                price: 100,
                retailPrice: 50
            }, struct);
            result.valid.should.be.false();
            result.errors[""][0].should.equal("Price is not profitable");
        });
    });
    describe("for required nested objects", function () {
        var objectStructure = validator_1.obj({
            id: validator_1.num().required().must(function (v) { return v > 0; }),
            title: validator_1.str().required().must(function (s) { return s.length < 10; }),
            delivery: validator_1.obj({
                price: validator_1.num().required().must(function (v) { return v > 0; }),
                address: validator_1.str().required().notEmpty()
            }, "Delivery data is required")
        });
        it("should fail on nested object missing", function () {
            var invalidObject = {
                id: 10,
                title: "test"
            };
            var result = validator_1.validate(invalidObject, objectStructure);
            result.valid.should.be.false();
            should(result.errors["delivery"][0]).equal("Delivery data is required");
        });
    });
    describe("for optional nested objects", function () {
        var objectStructure = validator_1.obj({
            id: validator_1.num().required().must(function (v) { return v > 0; }),
            title: validator_1.str().required().must(function (s) { return s.length < 10; }),
            delivery: validator_1.objOptional({
                price: validator_1.num().required().must(function (v) { return v > 0; }),
                address: validator_1.str().required().notEmpty()
            })
        });
        it("should pass valid object", function () {
            var validObject = {
                id: 10,
                title: "testtitle",
                delivery: {
                    price: 15,
                    address: "test address"
                }
            };
            var result = validator_1.validate(validObject, objectStructure);
            result.valid.should.be.true();
        });
        it("should pass valid object with null inner object", function () {
            var validObject = {
                id: 10,
                title: "testtitle"
            };
            var result = validator_1.validate(validObject, objectStructure);
            result.valid.should.be.true();
        });
        it("should fail on invalid inner object data", function () {
            var invalidObject = {
                id: 20,
                title: "test",
                delivery: {
                    address: "test address"
                }
            };
            var result = validator_1.validate(invalidObject, objectStructure);
            result.valid.should.be.false();
            result.errors.should.not.be.null();
            should(result.errors["delivery.price"]).not.be.null();
            should(result.errors["delivery.price"]).not.length(1);
            should(result.errors["delivery.price"][0]).equal("Value is required");
        });
    });
    describe("for expandable object", function () {
        var structure = validator_1.expandableObject({
            id: validator_1.num().required().must(function (v) { return v > 10; }),
            title: validator_1.str().required().must(function (v) { return v.length < 20; })
        });
        it("should preserve non-validatable properties", function () {
            var validObject = {
                id: 20,
                title: "test",
                delivery: {
                    price: 20,
                    address: "test address"
                }
            };
            var result = validator_1.validate(validObject, structure);
            result.valid.should.be.true();
            result.value["id"].should.equal(20);
            result.value["title"].should.equal("test");
            result.value["delivery"].should.equal(validObject.delivery);
        });
    });
};
//# sourceMappingURL=object-validator-test.js.map