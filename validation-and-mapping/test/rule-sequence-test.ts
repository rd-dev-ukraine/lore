import * as should from "should";

import {assertBlock } from "./utils";
import { validateWithPromise as validate, rules } from "../validator";

export default () => {
    describe("of primitive type rules", () => {
        it("must run all rules if not configured to stop on failure", done => {
            const rule = rules.num()
                .must(v => v > 5, { errorMessage: "> 5", stopOnFailure: false })
                .must(v => v > 10, { errorMessage: "> 10", stopOnFailure: false })
                .must(v => v > 20, { errorMessage: "> 20", stopOnFailure: false });

            validate(1, rule)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err).deepEqual({
                        "": ["> 5", "> 10", "> 20"]
                    });
                }));
        });

        it("must run all rules if not configured to stop on failure when first rules passed", done => {
            const rule = rules.num()
                .must(v => v > 5, { errorMessage: "> 5", stopOnFailure: false })
                .must(v => v > 10, { errorMessage: "> 10", stopOnFailure: false })
                .must(v => v > 20, { errorMessage: "> 20", stopOnFailure: false });

            validate(15, rule)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err).deepEqual({
                        "": ["> 20"]
                    });
                }));
        });

        it("must run rules until first failure if configured to stop on failure", done => {
            const rule = rules.num()
                .must(v => v > 5, { errorMessage: "> 5", stopOnFailure: true })
                .must(v => v > 10, { errorMessage: "> 10", stopOnFailure: true })
                .must(v => v > 20, { errorMessage: "> 20", stopOnFailure: true });

            validate(1, rule)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err).deepEqual({
                        "": ["> 5"]
                    });
                }));
        });

        it("must run rules until first failure if some rules configured to stop on failure and some rules not", done => {
            const rule = rules.num()
                .must(v => v > 5, { errorMessage: "> 5", stopOnFailure: false })
                .must(v => v > 10, { errorMessage: "> 10", stopOnFailure: true })
                .must(v => v > 20, { errorMessage: "> 20", stopOnFailure: false });

            validate(1, rule)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err).deepEqual({
                        "": ["> 5", "> 10"]
                    });
                }));
        });
    });

    describe("of composite type rules", () => {

        it("must run main rule if before rules failed but configured to continue", done => {
            const rule = rules.obj(
                {
                    id: rules.num().must(v => v > 0, { errorMessage: "> 0" })
                })
                .before((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: false })
                .before((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: false });

            validate(
                {
                    id: -5
                },
                rule)
                .then(() => done("Must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err).deepEqual({
                        "": ["> 50", "> 100"],
                        "id": ["> 0"]
                    })
                }));
        });

        describe("must not run main rule if before rules failed and configured to stop", () => {
            const rule = rules.obj(
                {
                    id: rules.num().must(v => v > 0, { errorMessage: "> 0" })
                })
                .before((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: true })
                .before((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: true });

            it("check it runs first rule only", done => {
                validate(
                    {
                        id: -5
                    },
                    rule)
                    .then(() => done("Must fail"))
                    .catch(err => assertBlock(done, () => {
                        should(err).deepEqual({
                            "": ["> 50"]
                        })
                    }));
            });

            it("check it runs next rule if first passes", done => {
                validate(
                    {
                        id: 75
                    },
                    rule)
                    .then(() => done("Must fail"))
                    .catch(err => assertBlock(done, () => {
                        should(err).deepEqual({
                            "": ["> 100"]
                        })
                    }));
            });
        });

        describe("if after rule specified", () => {
            // .after((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: true })
            // .after((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: true });

            describe("and main rule configured to stop", () => {
                const rule = rules.obj(
                    {
                        id: rules.num().must(v => v > 0, { errorMessage: "> 0" })
                    }, true)
                    .after((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: false })
                    .after((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: false });

                it("should not run after rules if main rule failed", done => {
                    validate(
                        {
                            id: -5
                        },
                        rule)
                        .then(() => done("Must fail"))
                        .catch(err => assertBlock(done, () => {
                            should(err).deepEqual({
                                "id": ["> 0"]
                            })
                        }));
                });

                it("should run after rules if main rule passed", done => {
                    validate(
                        {
                            id: 5
                        },
                        rule)
                        .then(() => done("Must fail"))
                        .catch(err => assertBlock(done, () => {
                            should(err).deepEqual({
                                "": ["> 50", "> 100"]
                            })
                        }));
                });

            });

            describe("and main rule configured to pass", () => {
                const rule = rules.obj(
                    {
                        id: rules.num().must(v => v > 0, { errorMessage: "> 0" })
                    }, false)
                    .after((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: false })
                    .after((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: false });

                it("should run after rules if main rule failed", done => {
                    validate(
                        {
                            id: -5
                        },
                        rule)
                        .then(() => done("Must fail"))
                        .catch(err => assertBlock(done, () => {
                            should(err).deepEqual({
                                "id": ["> 0"],
                                "": ["> 50", "> 100"]
                            })
                        }));
                });

                it("should run after rules if main rule passed", done => {
                    validate(
                        {
                            id: 5
                        },
                        rule)
                        .then(() => done("Must fail"))
                        .catch(err => assertBlock(done, () => {
                            should(err).deepEqual({
                                "": ["> 50", "> 100"]
                            })
                        }));
                });

            });

            describe("and main rule configured passed", () => {
                const rule = rules.obj(
                    {
                        id: rules.num().must(v => v > 0, { errorMessage: "> 0" })
                    }, false)
                    .after((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: true })
                    .after((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: true });

                describe("and after rules stops on failure", () => {
                    it("should stop on first after rule if failed", done => {
                        validate(
                            {
                                id: 20
                            },
                            rule)
                            .then(() => done("Must fail"))
                            .catch(err => assertBlock(done, () => {
                                should(err).deepEqual({
                                    "": ["> 50"]
                                })
                            }));
                    });

                });

            });
        });
    });
};
