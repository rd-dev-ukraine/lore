/// <reference path="../validator/validator.d.ts" />
import * as should from "should";

import { validate, obj, objOptional, str, num } from "../validator";

export default () => {
    describe("for object with flat structure", () => {
        const objectStructure = obj({
            id: str().required().notEmpty("Empty!!"),
            title: str().required().must(v => v.length < 10),
            description: str(),
            price: num().required().must(p => p > 0, "Positive!!!")
        });

        it("should pass validation for correct structure", () => {
            const test = {
                id: "2342340",
                title: "test",
                price: 23
            };

            const result = validate(test, objectStructure);
            result.valid.should.be.true();
        });

        it("should not put extra properties in result", () => {
            const test = {
                id: "2342340",
                title: "test",
                price: 23,
                delivery: 233
            };

            const result = validate(test, objectStructure);
            result.valid.should.be.true();

            should(result["delivery"]).be.undefined();
        });

        it("should fail for invalid property values", () => {
            const test = {
                id: "",
                title: "test",
                price: -23
            };

            const result = validate(test, objectStructure);
            result.valid.should.be.false();
            Object.keys(result.errors).length.should.equal(2);
            result.errors["id"].length.should.equal(1);
            result.errors["id"][0].should.equal("Empty!!");
            result.errors["price"].length.should.equal(1);
            result.errors["price"][0].should.equal("Positive!!!");
        });
    });

    describe("for nested objects", () => {
        const objectStructure = obj({
            id: num().required().must(v => v > 0),
            title: str().required().must(s => s.length < 10),
            delivery: objOptional({
                price: num().required().must(v => v > 0),
                address: str().required().notEmpty()
            })
        });

        it("should pass valid object", () => {
            const validObject = {
                id: 10,
                title: "testtitle",
                delivery: {
                    price: 15,
                    address: "test address"
                }
            };

            const result = validate(validObject, objectStructure);
            result.valid.should.be.true();            
        });

        it("should pass valid object with null inner object", () => {
            const validObject = {
                id: 10,
                title: "testtitle"
            };

            const result = validate(validObject, objectStructure);
            result.valid.should.be.true();            
        });

        it("should fail on invalid inner object data", () => {
            const invalidObject = {
                id: 20,
                title: "test",
                delivery: {
                    address: "test address"
                }
            };

            const result = validate(invalidObject, objectStructure);

            result.valid.should.be.false();
            result.errors.should.not.be.null();
            should(result.errors["delivery.price"]).not.be.null();
            should(result.errors["delivery.price"]).not.length(1);
            should(result.errors["delivery.price"][0]).equal("Value is required");
        })
    });
};