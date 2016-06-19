"use strict";
var should = require("should");
var utils_1 = require("./utils");
var validator_1 = require("../validator");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    describe("for numbers hash", function () {
        var numbersHash = validator_1.rules.hash(validator_1.rules.num().required().must(function (n) { return n > 0 && n < 10; }));
        it("must pass valid numbers", function (done) {
            var validHash = {
                one: 1,
                two: 2,
                three: 3,
                four: 4
            };
            validator_1.validateWithPromise(validHash, numbersHash)
                .then(function (v) { return utils_1.assertBlock(done, function () {
                should(v).deepEqual(validHash);
            }); })
                .catch(function (err) {
                done("Must pass");
            });
        });
        it("must fail on invalid numbers", function (done) {
            var invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };
            validator_1.validateWithPromise(invalidHash, numbersHash)
                .then(function () { return done("Must fail"); })
                .catch(function (err) { return utils_1.assertBlock(done, function () {
                err.should.deepEqual({
                    "three": ["Value is not a valid number."]
                });
            }); });
        });
        it("must not fail and skip invalid if configured", function (done) {
            var numbersHashWithSkip = validator_1.rules.hash(validator_1.rules.num().required().must(function (n) { return n > 0 && n < 10; })).skipInvalidElements();
            var invalidHash = {
                one: 1,
                two: 2,
                three: "three"
            };
            validator_1.validateWithPromise(invalidHash, numbersHashWithSkip)
                .then(function (r) { return utils_1.assertBlock(done, function () {
                r.should.deepEqual({
                    one: 1,
                    two: 2
                });
            }); })
                .catch(function () { return done("Must pass!"); });
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
//# sourceMappingURL=hash-validator-test.js.map