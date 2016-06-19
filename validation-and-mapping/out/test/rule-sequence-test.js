"use strict";
var should = require("should");
var utils_1 = require("./utils");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("of primitive type rules", function () {
        it("must run all rules if not configured to stop on failure", function (done) {
            var rule = validator_1.rules.num()
                .must(function (v) { return v > 5; }, { errorMessage: "> 5", stopOnFailure: false })
                .must(function (v) { return v > 10; }, { errorMessage: "> 10", stopOnFailure: false })
                .must(function (v) { return v > 20; }, { errorMessage: "> 20", stopOnFailure: false });
            validator_1.validateWithPromise(1, rule)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err).deepEqual({
                    "": ["> 5", "> 10", "> 20"]
                });
            }); });
        });
        it("must run all rules if not configured to stop on failure when first rules passed", function (done) {
            var rule = validator_1.rules.num()
                .must(function (v) { return v > 5; }, { errorMessage: "> 5", stopOnFailure: false })
                .must(function (v) { return v > 10; }, { errorMessage: "> 10", stopOnFailure: false })
                .must(function (v) { return v > 20; }, { errorMessage: "> 20", stopOnFailure: false });
            validator_1.validateWithPromise(15, rule)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err).deepEqual({
                    "": ["> 20"]
                });
            }); });
        });
        it("must run rules until first failure if configured to stop on failure", function (done) {
            var rule = validator_1.rules.num()
                .must(function (v) { return v > 5; }, { errorMessage: "> 5", stopOnFailure: true })
                .must(function (v) { return v > 10; }, { errorMessage: "> 10", stopOnFailure: true })
                .must(function (v) { return v > 20; }, { errorMessage: "> 20", stopOnFailure: true });
            validator_1.validateWithPromise(1, rule)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err).deepEqual({
                    "": ["> 5"]
                });
            }); });
        });
        it("must run rules until first failure if some rules configured to stop on failure and some rules not", function (done) {
            var rule = validator_1.rules.num()
                .must(function (v) { return v > 5; }, { errorMessage: "> 5", stopOnFailure: false })
                .must(function (v) { return v > 10; }, { errorMessage: "> 10", stopOnFailure: true })
                .must(function (v) { return v > 20; }, { errorMessage: "> 20", stopOnFailure: false });
            validator_1.validateWithPromise(1, rule)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err).deepEqual({
                    "": ["> 5", "> 10"]
                });
            }); });
        });
    });
    describe("of composite type rules", function () {
        it("must run main rule if before rules failed but configured to continue", function (done) {
            var rule = validator_1.rules.obj({
                id: validator_1.rules.num().must(function (v) { return v > 0; }, { errorMessage: "> 0" })
            })
                .before(function (obj) { return obj.id > 50; }, { errorMessage: "> 50", stopOnFailure: false })
                .before(function (obj) { return obj.id > 100; }, { errorMessage: "> 100", stopOnFailure: false });
            validator_1.validateWithPromise({
                id: -5
            }, rule)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                should(err).deepEqual({
                    "": ["> 50", "> 100"],
                    "id": ["> 0"]
                });
            }); });
        });
        describe("must not run main rule if before rules failed and configured to stop", function () {
            var rule = validator_1.rules.obj({
                id: validator_1.rules.num().must(function (v) { return v > 0; }, { errorMessage: "> 0" })
            })
                .before(function (obj) { return obj.id > 50; }, { errorMessage: "> 50", stopOnFailure: true })
                .before(function (obj) { return obj.id > 100; }, { errorMessage: "> 100", stopOnFailure: true });
            it("check it runs first rule only", function (done) {
                validator_1.validateWithPromise({
                    id: -5
                }, rule)
                    .then(function () { return done("Must fail"); })
                    .catch(function (err) { return utils_1.assertBlock(done, function () {
                    should(err).deepEqual({
                        "": ["> 50"]
                    });
                }); });
            });
            it("check it runs next rule if first passes", function (done) {
                validator_1.validateWithPromise({
                    id: 75
                }, rule)
                    .then(function () { return done("Must fail"); })
                    .catch(function (err) { return utils_1.assertBlock(done, function () {
                    should(err).deepEqual({
                        "": ["> 100"]
                    });
                }); });
            });
        });
        describe("if after rule specified", function () {
            // .after((obj: any) => obj.id > 50, { errorMessage: "> 50", stopOnFailure: true })
            // .after((obj: any) => obj.id > 100, { errorMessage: "> 100", stopOnFailure: true });
            describe("and main rule configured to stop", function () {
                var rule = validator_1.rules.obj({
                    id: validator_1.rules.num().must(function (v) { return v > 0; }, { errorMessage: "> 0" })
                }, true)
                    .after(function (obj) { return obj.id > 50; }, { errorMessage: "> 50", stopOnFailure: false })
                    .after(function (obj) { return obj.id > 100; }, { errorMessage: "> 100", stopOnFailure: false });
                it("should not run after rules if main rule failed", function (done) {
                    validator_1.validateWithPromise({
                        id: -5
                    }, rule)
                        .then(function () { return done("Must fail"); })
                        .catch(function (err) { return utils_1.assertBlock(done, function () {
                        should(err).deepEqual({
                            "id": ["> 0"]
                        });
                    }); });
                });
                it("should run after rules if main rule passed", function (done) {
                    validator_1.validateWithPromise({
                        id: 5
                    }, rule)
                        .then(function () { return done("Must fail"); })
                        .catch(function (err) { return utils_1.assertBlock(done, function () {
                        should(err).deepEqual({
                            "": ["> 50", "> 100"]
                        });
                    }); });
                });
            });
            describe("and main rule configured to pass", function () {
                var rule = validator_1.rules.obj({
                    id: validator_1.rules.num().must(function (v) { return v > 0; }, { errorMessage: "> 0" })
                }, false)
                    .after(function (obj) { return obj.id > 50; }, { errorMessage: "> 50", stopOnFailure: false })
                    .after(function (obj) { return obj.id > 100; }, { errorMessage: "> 100", stopOnFailure: false });
                it("should run after rules if main rule failed", function (done) {
                    validator_1.validateWithPromise({
                        id: -5
                    }, rule)
                        .then(function () { return done("Must fail"); })
                        .catch(function (err) { return utils_1.assertBlock(done, function () {
                        should(err).deepEqual({
                            "id": ["> 0"],
                            "": ["> 50", "> 100"]
                        });
                    }); });
                });
                it("should run after rules if main rule passed", function (done) {
                    validator_1.validateWithPromise({
                        id: 5
                    }, rule)
                        .then(function () { return done("Must fail"); })
                        .catch(function (err) { return utils_1.assertBlock(done, function () {
                        should(err).deepEqual({
                            "": ["> 50", "> 100"]
                        });
                    }); });
                });
            });
            describe("and main rule configured passed", function () {
                var rule = validator_1.rules.obj({
                    id: validator_1.rules.num().must(function (v) { return v > 0; }, { errorMessage: "> 0" })
                }, false)
                    .after(function (obj) { return obj.id > 50; }, { errorMessage: "> 50", stopOnFailure: true })
                    .after(function (obj) { return obj.id > 100; }, { errorMessage: "> 100", stopOnFailure: true });
                describe("and after rules stops on failure", function () {
                    it("should stop on first after rule if failed", function (done) {
                        validator_1.validateWithPromise({
                            id: 20
                        }, rule)
                            .then(function () { return done("Must fail"); })
                            .catch(function (err) { return utils_1.assertBlock(done, function () {
                            should(err).deepEqual({
                                "": ["> 50"]
                            });
                        }); });
                    });
                });
            });
        });
    });
};
//# sourceMappingURL=rule-sequence-test.js.map