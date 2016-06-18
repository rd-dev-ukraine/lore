"use strict";
var should = require("should");
var utils_1 = require("./utils");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for object with flat structure", function () {
        var objectStructure = validator_1.rules.obj({
            id: validator_1.rules.str().required().notEmpty("Empty!!"),
            title: validator_1.rules.str().notEmpty().must(function (v) { return v.length > 3; }, "Too short"),
            description: validator_1.rules.str(),
            price: validator_1.rules.num().required().must(function (p) { return p > 0; }, "Positive!!!")
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
            }).after(function (v) { return v["price"] < v["retailPrice"]; }, "Price is not profitable");
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
                id: validator_1.rules.num().required().must(function (v) { return v > 100; }, "ID must be greater than 100"),
                price: validator_1.rules.num().required(),
                retailPrice: validator_1.rules.num().required()
            }).before(function (v) { return v["price"] < v["retailPrice"]; }, "Price is not profitable");
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
    describe("for required nested objects", function () {
        var objectStructure = validator_1.rules.obj({
            id: validator_1.rules.num().required().must(function (v) { return v > 0; }, "ID must be greater than zero"),
            title: validator_1.rules.str().required().must(function (s) { return s.length < 10; }),
            delivery: validator_1.rules.obj({
                price: validator_1.rules.num().required().must(function (v) { return v > 0; }),
                address: validator_1.rules.str().required().notEmpty()
            }).required("Delivery data is required")
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
                price: validator_1.rules.num().required().must(function (v) { return v > 0; }),
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
                console.dir(err);
                done("Must pass!");
            });
        });
        // it("should fail on invalid inner object data", () => {
        //     const invalidObject = {
        //         id: 20,
        //         title: "test",
        //         delivery: {
        //             address: "test address"
        //         }
        //     };
        //     const result = validate(invalidObject, objectStructure);
        //     result.valid.should.be.false();
        //     result.errors.should.not.be.null();
        //     should(result.errors["delivery.price"]).not.be.null();
        //     should(result.errors["delivery.price"]).not.length(1);
        //     should(result.errors["delivery.price"][0]).equal("Value is required");
        // })
    });
    // describe("for expandable object", () => {
    //     const structure = expandableObject({
    //         id: num().required().must(v => v > 10),
    //         title: str().required().must(v => v.length < 20)
    //     });
    //     it("should preserve non-validatable properties", () => {
    //         const validObject = {
    //             id: 20,
    //             title: "test",
    //             delivery: {
    //                 price: 20,
    //                 address: "test address"
    //             }
    //         };
    //         const result = validate(validObject, structure);
    //         result.valid.should.be.true();
    //         result.value["id"].should.equal(20);
    //         result.value["title"].should.equal("test");
    //         result.value["delivery"].should.equal(validObject.delivery);
    //     });
    // });
    // describe("for multiple validators", () => {
    //     const idValidator = expandableObject({
    //         id: num().required().transform(v => v * 10)
    //     });
    //     const titleValidator = expandableObject({
    //         title: str().required().must(t => t.length < 20)
    //     });
    //     const idValidityValidator = expandableObject({
    //         id: num().required().must(v => v < 100, "Id too large")
    //     });
    //     it("valid object must pass validator chain", () => {
    //         const validObject = {
    //             id: 5,
    //             title: "test"
    //         };
    //         const result = validate(validObject, idValidator, titleValidator, idValidityValidator);
    //         result.valid.should.be.true();
    //         result.value.should.deepEqual({
    //             id: 50,
    //             title: "test"
    //         });
    //     });
    //     it("must stop if failed on first validator", () => {
    //         const invalidObject = {
    //             id: "sdfsdf",
    //             title: "test"
    //         };
    //         const result = validate(invalidObject, idValidator, titleValidator, idValidityValidator);
    //         result.valid.should.be.false();
    //         should(result.errors["id"][0]).equal("Value is not a valid number");
    //     });
    //     it("validators must validate data converted by previous validator", () => {
    //         const invalidObject = {
    //             id: 40,
    //             title: "test"
    //         };
    //         const result = validate(invalidObject, idValidator, titleValidator, idValidityValidator);
    //         result.valid.should.be.false();
    //         should(result.errors["id"][0]).equal("Id too large");
    //     });
    // });
};
//# sourceMappingURL=object-validator-test.js.map