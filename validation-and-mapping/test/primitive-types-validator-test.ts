/// <reference path="../validator/validator.d.ts" />
import * as should from "should";

import { validator, str, num } from "../validator/validator";

export default () => {
    describe("for string", () => {
        it("should validate if value is string", () => {
            const result = validator.run("213", str());

            result.valid.should.be.true();
            should(result.value).be.equal("213");
        });

        it("should error if value is not string and conversion disabled", () => {
            const result = validator.run(213, str("Value is not a valid string", false));
            result.valid.should.be.false();
            result.errors.should.keys("");
        });

        it("should be ok if value is not string and conversion enabled", () => {
            const result = validator.run(213, str());
            result.valid.should.be.true();
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

        it("should pass if null string and no required rule", () => {
            const result = validator.run(null, str());
            result.valid.should.be.true();
            should(result.value).be.null();
        });

        it("should false if null string and required rule included", () => {
            const result = validator.run(null, str().required());
            result.valid.should.be.false();
            should(result.value).be.null();
        });
    });

    describe("for number", () => {
        it("should validate if value is number", () => {
            const numValue = 233.4;

            const validResult = validator.run(numValue, num().must(v => v > 200 && v < 300));

            validResult.valid.should.be.true();
            validResult.value.should.equal(numValue);

            const convertibleValue = "2344.4";
            const validConvertedResult = validator.run(convertibleValue, num());
            validConvertedResult.valid.should.be.true();
            validConvertedResult.value.should.equal(2344.4);

            const notConvertibleValue = "sdfsdf";
            const invalidResult = validator.run(notConvertibleValue, num());
            invalidResult.valid.should.be.false();
            invalidResult.value.should.be.NaN();
        });

        
        it("should pass if null value and no required rule", () => {
            const result = validator.run(null, num());
            result.valid.should.be.true();
            should(result.value).be.null();
        });

        it("should false if null value and required rule included", () => {
            const result = validator.run(null, num().required());
            result.valid.should.be.false();
            should(result.value).be.null();
        });
    });
};