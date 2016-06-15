/// <reference path="../validator/validator.d.ts" />
import * as should from "should";

import { validator, str } from "../validator/validator";

export default () => {
    describe("for string", () => {
        it("should validate if value is string", () => {
            const result = validator.run("213", str());

            result.valid.should.be.true();
            should(result.value).be.equal("213");
        });

        it("should error if value is not string", () => {
            const result = validator.run(213, str());
            result.valid.should.be.false();
            result.errors.should.keys("");
        });

        it("should run chained validators", () => {
            const result = validator.run("", str().notEmpty());
            result.valid.should.be.false();
            result.errors[""].length.should.equal(1);
        });

        it("should run chained validators successfuly", () => {
            const result = validator.run("23234", str().notEmpty());
            result.valid.should.be.true();
            result.value.should.equal("23234");
            should( result.errors).be.undefined();
        });
    });
};