import * as should from "should";

import {assertBlock } from "./utils";
import { validateWithPromise as validate, rules } from "../validator";


export default () => {
    describe("for number array", () => {
        const numberArrayValidator = rules.arr(
            rules.num().required().must(v => v > 0 && v < 10)
        );

        it("must not fail on null value if required is not specified", done => {
            validate(null, numberArrayValidator)
                .then(v => assertBlock(done, () => {
                    should(v).be.null();
                }))
                .catch(err => done("Must pass but failed with error" + JSON.stringify(err)));

        });

        it("must fail on null value if required is specified", done => {
            const arrayRequiredRule = numberArrayValidator.required({ errorMessage: "NULL!!" });
            validate(null, arrayRequiredRule)
                .then(v => done("Must fail but passed with value " + JSON.stringify(v)))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "": ["NULL!!"]
                    });
                }));

        });

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

        it("should not fail on null value if required is not specified", done => {
            const rule = rules.arr(rules.num().required());

            validate(null, rule)
                .then(v => assertBlock(done, () => {
                    should(v).be.null();
                }))
                .catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });
    });

    describe("for object array", () => {
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

        it("should build correct indexes for nested arrays", done => {
            const rule = rules.arr(
                rules.arr(
                    rules.num().must(n => n < 10, { errorMessage: "Too large" })
                )
            );

            validate([
                [0, 1, 2],
                [0, 20],
                [22, 3, 10]
            ],
                rule).then(r => done("Must fail but passed with result " + JSON.stringify(r)))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "[1][1]": ["Too large"],
                        "[2][0]": ["Too large"],
                        "[2][2]": ["Too large"]
                    });
                }));
        });

        it("should build correct indexes for arrays nested in obj", done => {
            const rule = rules.arr(
                rules.arr(
                    rules.num().must(n => n < 10, { errorMessage: "Too large" })
                )
            );

            validate([
                [0, 1, 2],
                [0, 20],
                [22, 3, 10]
            ],
                rule).then(r => done("Must fail but passed with result " + JSON.stringify(r)))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "[1][1]": ["Too large"],
                        "[2][0]": ["Too large"],
                        "[2][2]": ["Too large"]
                    });
                }));
        });

        describe("should build correct path for nested structure", () => {
            const rule = rules.arr(
                rules.obj({
                    id: rules.num().required({ errorMessage: "ID is required" }),
                    data: rules.arr(
                        rules.str().notEmpty({ errorMessage: "Data item is required" })
                    ).required({ errorMessage: "Data is required" })
                        .after(arr => arr.length < 3, { errorMessage: "Too many data" })
                })
            );

            it("if error in most nest level", done => {
                validate([
                    {
                        id: 0,
                        data: ["1", "2"]
                    },
                    {
                        id: 1
                    },
                    {
                        id: 2,
                        data: ["3", null]
                    },
                    {
                        data: ["1", "2", "4", "3"]
                    }], rule)
                    .then(r => done("Must fail but passed with result " + JSON.stringify(r)))
                    .catch(err => assertBlock(done, () => {
                        err.should.deepEqual({
                            "[1].data": ["Data is required"],
                            "[2].data[1]": ["Data item is required"],
                            "[3].id": ["ID is required"],
                            "[3].data": ["Too many data"]
                        });
                    }));
            });

        });
    });
};
