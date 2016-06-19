import * as should from "should";

import {assertBlock } from "./utils";
import { validateWithPromise as validate, rules } from "../validator";


export default () => {
    describe("for number array", () => {
        const numberArrayValidator = rules.arr(
            rules.num().required().must(v => v > 0 && v < 10)
        );

        it("should pass for valid array", done => {
            const validArray = [1, 2, 4];

            validate(validArray, numberArrayValidator)
                .then(r => assertBlock(done, () => {
                    should(r).deepEqual([1, 2, 4]);
                }))
                .catch(err => done("Must not fail but failed with error " + JSON.stringify(err)));
        });

        it("should fail for invalid array", done => {
            const invalidArray = [1, 2, "sad"];

            validate(invalidArray, numberArrayValidator)
                .then(r => done("Must fail but passed with result " + JSON.stringify(r)))
                .catch(err => assertBlock(done, () => {

                    err.should.deepEqual({
                        "[2]": ["Value is not a valid number."]
                    });

                }));
        });

        it("should support filtering", done => {
            const numberArrayValidatorWithFilter = rules.arr(
                rules.num().required().must(v => v > 0 && v < 10)
            ).filter(v => v < 10);

            const numbers = [1, 2, 10, 20];

            validate(numbers, numberArrayValidatorWithFilter)
                .then(r => assertBlock(done, () => {
                    r.should.deepEqual([1, 2]);
                }))
                .catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });

        it("should use target indexes in error path when fail after filtering", done => {
            const numberArrayValidatorWithFilter = rules.arr(
                rules.num().required().must(v => v > 0 && v < 10, { errorMessage: "Too large" })
            ).filter(v => v < 50);

            const numbers = [1, 2, 100, 200, 4, 300, 20];

            validate(numbers, numberArrayValidatorWithFilter)
                .then(r => done("Must fail but passed with result " + JSON.stringify(r)))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "[6]": ["Too large"]
                    });
                }));
        });

        it("should correctly build path on failed element validator", done => {
            const rule = rules.arr(
                rules.obj({
                    id: rules.num().required().must(v => v < 10, { errorMessage: "Too large" }),
                    title: rules.str()
                })
            );

            validate(
                [
                    {
                        id: 1,
                        title: "one"
                    },
                    {
                        id: 10,
                        title: "ten"
                    }
                ],
                rule)
                .then(r => done("Must fail but passed with result " + JSON.stringify(r)))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "[1].id": ["Too large"]
                    })
                }));
        });

        it("should run before rules on non-filtered array", done => {
            const rule = rules.arr(
                rules.num().required()
            ).before(arr => arr[1] === 20, { errorMessage: "Element was filtered out" })
                .filter(e => e < 10);

            validate([1, 20, 3], rule)
                .then(r => assertBlock(done, () => {
                    r.should.deepEqual([1, 3]);
                }))
                .catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });

        it("should run after rules on filtered array", done => {
            const rule = rules.arr(
                rules.num().required()
            ).after(arr => arr[1] === 3, { errorMessage: "Element was not filtered out" })
                .filter(e => e < 10);

            validate([1, 20, 3], rule)
                .then(r => assertBlock(done, () => {
                    r.should.deepEqual([1, 3]);
                }))
                .catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });

        it("should run after rules on array with skipped invalid elements", done => {
            const rule = rules.arr(
                rules.num().required().must(v => v < 10, { errorMessage: "Too large" })
            ).after(arr => arr[1] === 3, { errorMessage: "Element was not filtered out" }).skipInvalidElements();

            validate([1, 20, 3], rule)
                .then(r => assertBlock(done, () => {
                    r.should.deepEqual([1, 3]);
                }))
                .catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });
    });
};
