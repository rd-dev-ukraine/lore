import * as should from "should";

import {assertBlock } from "./utils";
import { validateWithPromise as validate, rules } from "../validator";


export default () => {

    describe("for numbers hash", () => {
        const numbersHash = rules.hash(
            rules.num().required().must(n => n > 0 && n < 10)
        );

        it("must pass valid numbers", done => {
            const validHash = {
                one: 1,
                two: 2,
                three: 3,
                four: 4
            };

            validate(validHash, numbersHash)
                .then(v => assertBlock(done, () => {
                    should(v).deepEqual(validHash);
                }))
                .catch(err => {
                    done("Must pass");
                });
        });

        it("must fail on invalid numbers", done => {
            const invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };

            validate(invalidHash, numbersHash)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "three": ["Value is not a valid number."]
                    });
                }));
        });

        it("must not fail and skip invalid if configured", done => {

            const numbersHashWithSkip = rules.hash(
                rules.num().required().must(n => n > 0 && n < 10)
            ).skipInvalidElements();

            const invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };

            validate(invalidHash, numbersHashWithSkip)
                .then(r => assertBlock(done, () => {
                    r.should.deepEqual({
                        one: 1,
                        two: 2
                    });
                }))
                .catch(() => done("Must pass!"));
        });
    });

    // describe("for objects hash", () => {
    //     const objectHash = hash(
    //         obj({
    //             id: num().required(),
    //             title: str().required()
    //         })
    //     );

    //     it("must pass on valid hash", () => {
    //         const validHash = {
    //             "1": {
    //                 id: 1,
    //                 title: "one"
    //             },
    //             "2": {
    //                 id: 2,
    //                 title: "two"
    //             }
    //         };

    //         const result = validate<any, any>(validHash, objectHash);

    //         result.valid.should.be.true();
    //         result.value.should.deepEqual(validHash);
    //     });

    // });
};