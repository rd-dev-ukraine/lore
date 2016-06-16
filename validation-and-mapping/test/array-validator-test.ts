/// <reference path="../validator/validator.d.ts" />
import * as should from "should";

import { validate, obj, objOptional, str, num, hash, hashOptional, arr, arrOptional } from "../validator";

export default () => {
    describe("for number array", () => {
        const numberArrayValidator = arr(
            num().required().must(v => v > 0 && v < 10)
        );

        it("should pass for valid array", () => {
            const validArray = [1, 2, 4];

            const result = validate(validArray, numberArrayValidator);

            result.valid.should.be.true();
            result.value.should.deepEqual(validArray);
        });

        it("should fail for invalid array", () => {
            const invalidArray = [1, 2, "sad"];

            const result = validate(invalidArray, numberArrayValidator);
            result.valid.should.be.false();
            result.errors["[2]"][0].should.equal("Value is not a valid number");
        });

        it("should support filtering", () => {
            const numberArrayValidatorWithFilter = arr(
                num().required().must(v => v > 0 && v < 10)
            ).filterElements(v => v < 10);

            const numbers = [1, 2, 10, 20];

            const result = validate(numbers, numberArrayValidatorWithFilter);
            result.valid.should.be.true();
            result.value.should.deepEqual([1, 2]);
        });

        it("should use target indexes in error path when fail after filtering", () => {
            const numberArrayValidatorWithFilter = arr(
                num().required().must(v => v > 0 && v < 10)
            ).filterElements(v => v < 50);

            const numbers = [1, 2, 100, 200, 4, 300, 20];

            const result = validate(numbers, numberArrayValidatorWithFilter);
            result.valid.should.be.false();
            result.value.should.deepEqual([1, 2, 4, 20]);
            result.errors["[3]"][0].should.equal("Value is invalid");
        });

    });
};
