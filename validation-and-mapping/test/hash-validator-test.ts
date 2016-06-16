/// <reference path="../validator/validator.d.ts" />
import * as should from "should";

import { validate, obj, objOptional, str, num, hash, hashOptional } from "../validator";

export default () => {
    describe("for numbers hash", () => {
        const numbersHash = hash(
            num().required().must(n => n > 0 && n < 10)
        );

        it("must pass valid numbers", () => {
            const validHash = {
                one: 1,
                two: 2,
                three: 3,
                four: 4
            };

            const result = validate(validHash, numbersHash);

            result.valid.should.be.true();
            result.value.should.deepEqual(validHash);
            console.dir(result.value);
        });

        it("must fail on invalid numbers", () => {
            const invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };

            const result = validate(invalidHash, numbersHash);
            result.valid.should.be.false();
            should(result.errors["three"][0]).equal("Value is not a valid number");
        });
    });

    describe("for objects hash", () => {
        const objectHash = hash(
            obj({
                id: num().required(),
                title: str().required()
            })
        );

        it("must pass on valid hash", () => {
            const validHash = {
                "1": {
                    id: 1,
                    title: "one"
                },
                "2": {
                    id: 2,
                    title: "two"
                }
            };

            const result = validate<any, any>(validHash, objectHash);

            result.valid.should.be.true();
            result.value.should.deepEqual(validHash);
        });

    });
};