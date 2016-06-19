"use strict";
var should = require("should");
var utils_1 = require("./utils");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for object with flat structure", function () {
        var objectStructure = validator_1.rules.obj({
            id: validator_1.rules.str().required().notEmpty({ errorMessage: "Empty!!" }),
            title: validator_1.rules.str().notEmpty().must(function (v) { return v.length > 3; }, { errorMessage: "Too short" }),
            description: validator_1.rules.str(),
            price: validator_1.rules.num().required().must(function (p) { return p > 0; }, { errorMessage: "Positive!!!" })
        });
        it("must not fail on null value if required is not specified", function (done) {
            validator_1.validateWithPromise(null, objectStructure)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                should(v).be.null();
            }); })
                .catch(function (err) { return done("Must pass but failed with error" + JSON.stringify(err)); });
        });
        it("must fail on null value if required is specified", function (done) {
            var objRequiredRule = objectStructure.required({ errorMessage: "NULL!!" });
            validator_1.validateWithPromise(null, objRequiredRule)
                .then(function (v) { return done("Must fail but passed with value " + JSON.stringify(v)); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "": ["NULL!!"]
                });
            }); });
        });
        it("should pass validation for correct structure", function (done) {
            var test = {
                id: "2342340",
                title: "test",
                price: 23
            };
            validator_1.validateWithPromise(test, objectStructure)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.deepEqual({
                    id: "2342340",
                    title: "test",
                    price: 23,
                    description: ""
                });
            }); })
                .catch(function () { return done("Must fail"); });
        });
        it("should not put extra properties in result", function (done) {
            var test = {
                id: "2342340",
                title: "test",
                price: 23,
                delivery: 233
            };
            validator_1.validateWithPromise(test, objectStructure)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.deepEqual({
                    description: "",
                    id: "2342340",
                    title: "test",
                    price: 23
                });
            }); })
                .catch(function () { return done("Must pass!"); });
        });
        it("should fail for invalid property values", function (done) {
            var test = {
                id: "",
                title: "test",
                price: -23
            };
            validator_1.validateWithPromise(test, objectStructure)
                .then(function () { return done("Must fail!"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.id.should.deepEqual(["Empty!!"]);
                err.price.should.deepEqual(["Positive!!!"]);
            }); });
        });
    });
    describe("for any object", function () {
        it("should support .after() validation rule", function (done) {
            var struct = validator_1.rules.obj({
                id: validator_1.rules.num().required(),
                price: validator_1.rules.num().required(),
                retailPrice: validator_1.rules.num().required()
            }).after(function (v) { return v["price"] < v["retailPrice"]; }, { errorMessage: "Price is not profitable" });
            var result = validator_1.validateWithPromise({
                id: 10,
                price: 100,
                retailPrice: 50
            }, struct)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err[""]).deepEqual(["Price is not profitable"]);
            }); });
        });
    });
    describe("for any object", function () {
        it("should support .before() validation rule", function (done) {
            var struct = validator_1.rules.obj({
                id: validator_1.rules.num().required().must(function (v) { return v > 100; }, { errorMessage: "ID must be greater than 100" }),
                price: validator_1.rules.num().required(),
                retailPrice: validator_1.rules.num().required()
            }).before(function (v) { return v["price"] < v["retailPrice"]; }, { errorMessage: "Price is not profitable", stopOnFailure: true });
            var result = validator_1.validateWithPromise({
                id: 10,
                price: 100,
                retailPrice: 50
            }, struct)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err).deepEqual({
                    "": ["Price is not profitable"]
                });
            }); });
        });
    });
    describe("for secondary level nested object", function () {
        var v = validator_1.rules.obj({
            id: validator_1.rules.num().required(),
            delivery: validator_1.rules.obj({
                price: validator_1.rules.num(),
                address: validator_1.rules.obj({
                    code: validator_1.rules.num().required({ errorMessage: "Code is required." }),
                    addressLine1: validator_1.rules.str()
                }).required({ errorMessage: "Address is required" })
            }).required()
        });
        it("must correct build path for invalid most nested object", function (done) {
            validator_1.validateWithPromise({
                id: 23,
                delivery: {
                    price: 5.4,
                    address: {}
                }
            }, v).then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "delivery.address.code": ["Code is required."]
                });
            }); });
        });
    });
    describe("for required nested objects", function () {
        var objectStructure = validator_1.rules.obj({
            id: validator_1.rules.num().required().must(function (v) { return v > 0; }, { errorMessage: "ID must be greater than zero" }),
            title: validator_1.rules.str().required().must(function (s) { return s.length < 10; }),
            delivery: validator_1.rules.obj({
                price: validator_1.rules.num().required().must(function (v) { return v > 0; }),
                address: validator_1.rules.str().required().notEmpty()
            }).required({ errorMessage: "Delivery data is required" })
        });
        it("should fail on nested object missing", function (done) {
            var invalidObject = {
                id: -10,
                title: "test"
            };
            validator_1.validateWithPromise(invalidObject, objectStructure)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    id: ["ID must be greater than zero"],
                    delivery: ["Delivery data is required"]
                });
            }); });
        });
    });
    describe("for optional nested objects", function () {
        var objectStructure = validator_1.rules.obj({
            id: validator_1.rules.num().required().must(function (v) { return v > 0; }),
            title: validator_1.rules.str().required().must(function (s) { return s.length < 10; }),
            delivery: validator_1.rules.obj({
                price: validator_1.rules.num()
                    .required({ errorMessage: "Price is required", stopOnFailure: false })
                    .must(function (v) { return v > 0; }, { errorMessage: "Price must be greater than zero" }),
                address: validator_1.rules.str().required().notEmpty()
            })
        });
        it("should pass valid object", function (done) {
            var validObject = {
                id: 10,
                title: "testtitle",
                delivery: {
                    price: 15,
                    address: "test address"
                }
            };
            validator_1.validateWithPromise(validObject, objectStructure)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.deepEqual({
                    id: 10,
                    title: "testtitle",
                    delivery: {
                        price: 15,
                        address: "test address"
                    }
                });
            }); })
                .catch(function () { return done("Must pass"); });
        });
        it("should pass valid object with null inner object", function (done) {
            var validObject = {
                id: 10,
                title: "testtitle"
            };
            validator_1.validateWithPromise(validObject, objectStructure)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.deepEqual({
                    id: 10,
                    title: "testtitle",
                    delivery: undefined
                });
            }); })
                .catch(function (err) {
                done("Must pass!");
            });
        });
        it("should fail on invalid inner object data", function (done) {
            var invalidObject = {
                id: 20,
                title: "test",
                delivery: {
                    address: "test address"
                }
            };
            validator_1.validateWithPromise(invalidObject, objectStructure)
                .then(function () { return done("Must fail!!"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "delivery.price": ["Price is required", "Price must be greater than zero"]
                });
            }); });
        });
    });
    describe("for expandable object", function () {
        var structure = validator_1.rules.obj({
            id: validator_1.rules.num().required().must(function (v) { return v > 10; }),
            title: validator_1.rules.str().required().must(function (v) { return v.length < 20; })
        }).expandable();
        it("should preserve non-validatable properties", function (done) {
            var validObject = {
                id: 20,
                title: "test",
                delivery: {
                    price: 20,
                    address: "test address"
                }
            };
            validator_1.validateWithPromise(validObject, structure)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                v.should.deepEqual({
                    id: 20,
                    title: "test",
                    delivery: {
                        price: 20,
                        address: "test address"
                    }
                });
            }); })
                .catch(function () { return done("Must pass"); });
        });
    });
    describe("for multiple validators", function () {
        var idValidator = validator_1.rules.obj({
            id: validator_1.rules.num()
                .required()
        }).expandable();
        var titleValidator = validator_1.rules.obj({
            title: validator_1.rules.str().required().must(function (t) { return t.length < 20; })
        }).expandable();
        var idValidityValidator = validator_1.rules.obj({
            id: validator_1.rules.num(false)
                .required()
                .must(function (v) {
                return isNaN(v) || v < 100;
            }, { errorMessage: "Id too large" })
        }).expandable();
        it("valid object must pass validator chain", function (done) {
            var validObject = {
                id: 5,
                title: "test"
            };
            validator_1.validateWithPromise(validObject, idValidator, titleValidator, idValidityValidator)
                .then(function (v) { return utils_1.assertBlock(done, function () {
            }); })
                .catch(function () { return done("Must pass"); });
        });
        it("must not stop if failed on first validator", function (done) {
            var invalidObject = {
                id: "sdfsdf",
                title: "test"
            };
            validator_1.validateWithPromise(invalidObject, idValidator.stopOnFail(false), titleValidator.stopOnFail(false), idValidityValidator.stopOnFail(false))
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "id": ["Value is not a valid number.", "Value is not a valid number."]
                });
            }); });
        });
        it("validators must validate data converted by previous validator", function (done) {
            var invalidObject = {
                id: "400",
                title: "test"
            };
            validator_1.validateWithPromise(invalidObject, idValidator, titleValidator, idValidityValidator)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    id: ["Id too large"]
                });
            }); });
        });
    });
};
//# sourceMappingURL=object-validator-test.js.map