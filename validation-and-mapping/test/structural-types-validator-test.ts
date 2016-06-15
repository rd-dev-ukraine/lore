/// <reference path="../validator/validator.d.ts" />
import * as should from "should";

import { validator, obj, str, num } from "../validator/validator";

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

            const result = validator.run(test, objectStructure);
            result.valid.should.be.true();
        });

        it("should not put extra properties in result", () => {
            const test = {
                id: "2342340",
                title: "test",
                price: 23,
                delivery: 233
            };

            const result = validator.run(test, objectStructure);
            result.valid.should.be.true();

            should(result["delivery"]).be.undefined();
        });

        it("should fail for invalid property values", () => {
            const test = {
                id: "",
                title: "test",
                price: -23
            };

            const result = validator.run(test, objectStructure);
            result.valid.should.be.false();
            Object.keys(result.errors).length.should.equal(2);
            result.errors["id"].length.should.equal(1);
            result.errors["id"][0].should.equal("Empty!!");
            result.errors["price"].length.should.equal(1);
            result.errors["price"][0].should.equal("Positive!!!");
        });
    });
};