import * as should from "should";

import {assertBlock } from "./utils";
import { validateWithPromise as validate, rules } from "../validator";

export default () => {
    describe("for object with flat structure", () => {
        const objectStructure = rules.obj({
            id: rules.str().required().notEmpty("Empty!!"),
            title: rules.str().notEmpty().must(v => v.length > 3, "Too short"),
            description: rules.str(),
            price: rules.num().required().must(p => p > 0, "Positive!!!")
        });

        it("should pass validation for correct structure", done => {
            const test = {
                id: "2342340",
                title: "test",
                price: 23
            };

            validate(test, objectStructure)
                .then(v => assertBlock(done, () => {
                    v.should.deepEqual({
                        id: "2342340",
                        title: "test",
                        price: 23,
                        description: ""
                    });
                }))
                .catch(() => done("Must fail"));
        });

        it("should not put extra properties in result", done => {
            const test = {
                id: "2342340",
                title: "test",
                price: 23,
                delivery: 233
            };

            validate(test, objectStructure)
                .then(v => assertBlock(done, () => {
                    v.should.deepEqual({
                        description: "",
                        id: "2342340",
                        title: "test",
                        price: 23
                    });
                }))
                .catch(() => done("Must pass!"));
        });

        it("should fail for invalid property values", done => {
            const test = {
                id: "",
                title: "test",
                price: -23
            };

            validate(test, objectStructure)
                .then(() => done("Must fail!"))
                .catch(err => assertBlock(done, () => {
                    err.id.should.deepEqual(["Empty!!"]);
                    err.price.should.deepEqual(["Positive!!!"]);
                }));
        });
    });

    describe("for any object", () => {
        it("should support .after() validation rule", done => {
            const struct = rules.obj({
                id: rules.num().required(),
                price: rules.num().required(),
                retailPrice: rules.num().required()
            }).after(v => v["price"] < v["retailPrice"], "Price is not profitable");

            const result = validate<any>({
                id: 10,
                price: 100,
                retailPrice: 50
            }, struct)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["Price is not profitable"]);
                }));
        });
    });

    describe("for any object", () => {
        it("should support .before() validation rule", done => {
            const struct = rules.obj({
                id: rules.num().required().must(v => v > 100, "ID must be greater than 100"),
                price: rules.num().required(),
                retailPrice: rules.num().required()
            }).before(v => v["price"] < v["retailPrice"], "Price is not profitable");

            const result = validate<any>({
                id: 10,
                price: 100,
                retailPrice: 50
            }, struct)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err).deepEqual({
                        "": ["Price is not profitable"]
                    });
                }));
        });
    });

    describe("for required nested objects", () => {
        const objectStructure = rules.obj({
            id: rules.num().required().must(v => v > 0, "ID must be greater than zero"),
            title: rules.str().required().must(s => s.length < 10),
            delivery: rules.obj({
                price: rules.num().required().must(v => v > 0),
                address: rules.str().required().notEmpty()
            }).required("Delivery data is required")
        });

        it("should fail on nested object missing", done => {
            const invalidObject = {
                id: -10,
                title: "test"
            };

            validate(invalidObject, objectStructure)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        id: ["ID must be greater than zero"],
                        delivery: ["Delivery data is required"]
                    })
                }));
        });
    });

    describe("for optional nested objects", () => {
        const objectStructure = rules.obj({
            id: rules.num().required().must(v => v > 0),
            title: rules.str().required().must(s => s.length < 10),
            delivery: rules.obj({
                price: rules.num()
                            .required("Price is required")
                            .must(v => v > 0, "Price must be greater than zero"),
                address: rules.str().required().notEmpty()
            })
        });

        it("should pass valid object", done => {
            const validObject = {
                id: 10,
                title: "testtitle",
                delivery: {
                    price: 15,
                    address: "test address"
                }
            };

            validate(validObject, objectStructure)
                .then(v => assertBlock(done, () => {
                    v.should.deepEqual({
                        id: 10,
                        title: "testtitle",
                        delivery: {
                            price: 15,
                            address: "test address"
                        }
                    });
                }))
                .catch(() => done("Must pass"));
        });

        it("should pass valid object with null inner object", done => {
            const validObject = {
                id: 10,
                title: "testtitle"
            };

            validate(validObject, objectStructure)
                .then(v => assertBlock(done, () => {
                    v.should.deepEqual({
                        id: 10,
                        title: "testtitle",
                        delivery: undefined
                    });
                }))
                .catch(err => {
                    console.dir(err);
                    done("Must pass!");
                });
        });

        it("should fail on invalid inner object data", done => {
            const invalidObject = {
                id: 20,
                title: "test",
                delivery: {
                    address: "test address"
                }
            };

            validate(invalidObject, objectStructure)
                .then(() => done("Must fail!!"))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "delivery.price": ["Price is required", "Price must be greater than zero"]
                    });
                }));
        });
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