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

    describe("for objects hash", () => {
        const objectHash = rules.hash(
            rules.obj({
                id: rules.num().required(),
                title: rules.str().required()
            })
        );

        it("must pass on valid hash", done => {
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

            validate(validHash, objectHash)
                .then(r => assertBlock(done, () => {
                    r.should.deepEqual(validHash);
                }))
                .catch(() => done("Must pass"));
        });

        it("must fail on element error", done => {
            const invalidHash = {
                "one": {
                    id: 1,
                    title: "one"
                },
                "two": {
                    id: "two",
                    title: "two"
                }
            };

            validate(invalidHash, objectHash)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "two.id": ["Value is not a valid number."]
                    });
                }));
        });

        it("must skip invalid elements on inner element error", done => {
            const objectHashWithSkip = objectHash.skipInvalidElements();

            const invalidHash = {
                "one": {
                    id: 1,
                    title: "one"
                },
                "two": {
                    id: "two",
                    title: "two"
                }
            };

            validate(invalidHash, objectHashWithSkip)
                .then(v => assertBlock(done, () => {
                    v.should.deepEqual({
                        "one": {
                            id: 1,
                            title: "one"
                        }
                    });
                }))
                .catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });
    });

    describe("for hash validator with filtering", () => {
        const elementRule = rules.obj({
            id: rules.num().required().must(v => v > 10, { errorMessage: "Too small" }),
            title: rules.str().required()
        });

        const hashRule = rules.hash(elementRule).filter(key => key.indexOf("i_") !== 0);

        it("must filter out elements", done => {

            validate(
                {
                    "one": {
                        id: 20,
                        title: "twenty"
                    },
                    "i_one": {
                        id: 1,
                        title: "one"
                    }
                },
                hashRule)
                .then(v => assertBlock(done, () => {
                    v.should.deepEqual({
                        "one": {
                            id: 20,
                            title: "twenty"
                        }
                    });
                }))
                .catch(() => done("Must pass"));
        });

        it("must fail on non-filtered elements", done => {

            validate(
                {
                    "one": {
                        id: 2,
                        title: "twenty"
                    },
                    "i_one": {
                        id: 1,
                        title: "one"
                    }
                },
                hashRule)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    err.should.deepEqual({
                        "one.id": ["Too small"]
                    });
                }));
        });

        it("must run before rule on filtered hash", done => {
            const hashRuleWithBefore = hashRule.before((h: any) => !h["i_one"], { errorMessage: "i_one is not filtered out" });

            validate(
                {
                    "first": {
                        id: 20,
                        title: "twenty"
                    },
                    "i_one": {
                        id: 1,
                        title: "one"
                    }
                },
                hashRuleWithBefore).then(r => assertBlock(done, () => {
                    r.should.deepEqual({
                        "first": {
                            id: 20,
                            title: "twenty"
                        }
                    })
                })).catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        });

        it("must run after rule on hash with skipped invalid elements", done => {
            const hashRuleWithAfter = hashRule.stopOnFail(false)
                                              .skipInvalidElements()
                                              .after((h: any) => !h["second"], { errorMessage: "second is not skipped as error" });

            validate(
                {
                    "first": {
                        id: 20,
                        title: "twenty"
                    },
                    "second": {
                        id: 1,
                        title: "one"
                    }
                },
                hashRuleWithAfter).then(r => assertBlock(done, () => {
                    r.should.deepEqual({
                        "first": {
                            id: 20,
                            title: "twenty"
                        }
                    })
                })).catch(err => done("Must pass but failed with error " + JSON.stringify(err)));
        })

    });
};