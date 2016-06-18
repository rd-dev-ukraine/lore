import * as should from "should";

import {assertBlock } from "./utils";
import { validateWithPromise as validate, rules } from "../validator";

export default () => {
    describe("for string", () => {
        it("should validate if value is string", done => {
            validate("213", rules.str())
                .then(value => assertBlock(done, () => {
                    should(value).be.equal("213");
                }))
                .catch(err => done(err));
        });

        it("should error if value is not string and conversion disabled", done => {
            validate(213, rules.str(false, "Value is not string"))
                .then(v => {
                    done("Validation must fail");
                })
                .catch(err => assertBlock(done, () => {
                    should(err[""][0]).be.equal("Value is not string");
                }));
        });

        it("should be ok if value is not string and conversion enabled", done => {
            validate(213, rules.str())
                .then(v => assertBlock(done, () => {
                    v.should.be.equal("213");
                }))
                .catch(err => {
                    done("Validation must not fail.");
                });
        });

        it("should run chained validators", done => {
            validate("", rules.str().notEmpty("Empty string is invalid!"))
                .then(() => {
                    done("Validation must faild.");
                })
                .catch(errors => assertBlock(done, () => {
                    errors[""][0].should.be.equal("Empty string is invalid!");
                }));
        });

        it("should pass if null string and no required rule", done => {
            validate(null, rules.str(false))
                .then(v => assertBlock(done, () => {
                    should(v).be.null();
                }))
                .catch(err => {
                    done("Validation should not fail.");
                });
        });

        it("should fail if null string and required rule included", done => {
            validate(null, rules.str(false).required("NULL!!"))
                .then(() => done("Validation must fail."))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["NULL!!"]);
                }));
        });

        it("should pass if null string and required rule included and conversion enabled", done => {
            validate(null, rules.str().required("NULL!!"))
                .then(v => assertBlock(done, () => {
                    v.should.equal("");
                }))
                .catch(() => done("Validation must pass!"));
        });

        it("should fail if notEmpty rule added for empty string", done => {
            validate("", rules.str().required("Required fail").notEmpty("Not empty fail"))
                .then(v => done("Validation must fail"))
                .catch(err => assertBlock(done, () => {
                    err[""].should.deepEqual(["Not empty fail"]);
                }));
        });

        it("should fail is must condition is failed", done => {
            validate("123", rules.str().required().must(v => v.length > 10, "Too short!"))
                .then(() => done("Must fail!"))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["Too short!"]);
                }));
        });

        it("should pass is must condition is met", done => {
            validate("1234567890", rules.str().required().must(v => v.length > 3, "Too short!"))
                .then(v => assertBlock(done, () => {
                    v.should.equal("1234567890");
                }))
                .catch(() => done("Must pass!!"));
        });
    });

    describe("for number", () => {
        it("should pass on valid number", done => {
            const numValue = 233.4;
            validate(numValue, rules.num().must(v => v > 200 && v < 300))
                .then(v => assertBlock(done, () => {
                    v.should.equal(numValue);
                }))
                .catch(err => done("Validation must pass!"));
        });

        it("should convert number if value is convertible", done => {
            const convertibleValue = "2344.4";
            validate(convertibleValue, rules.num())
                .then(v => assertBlock(done, () => {
                    v.should.equal(2344.4);
                }))
                .catch(() => done("Validation must pass and convert a number"));
        });

        it("should fail number if value is not convertible", done => {
            const convertibleValue = "sdffsdf";
            validate(convertibleValue, rules.num(true, "NOT CONVERTIBLE"))
                .then(v => done(v))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["NOT CONVERTIBLE"]);
                }));
        });

        it("should fail if value is convertible but conversion disabled", done => {
            const convertibleValue = "2344.4";
            validate(convertibleValue, rules.num(false, "NOT NUMBER!"))
                .then(v => done("Must not convert if conversion disabled!"))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["NOT NUMBER!"]);
                }));
        });

        it("should pass without conversion if null value and no required rule", done => {
            validate(null, rules.num(false))
                .then(v => assertBlock(done, () => {
                    should(v).be.null();
                }))
                .catch(() => done("Validation must pass!"));
        });

        it("should pass with conversion if null value and no required rule", done => {
            validate(null, rules.num())
                .then(v => assertBlock(done, () => {
                    should(v).be.null();
                }))
                .catch(() => done("Validation must pass!"));
        });

        it("should fail if null value and required rule included", done => {
            validate(null, rules.num(false).required("REQUIRED"))
                .then(() => done("Validation must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["REQUIRED"]);
                }));
        });

        it("should fail if conversion disabled and value is not a number", done => {
            validate("1223", rules.num(false, "NOT A NUMBER"))
                .then(() => done("Validation must fail"))
                .catch(err => assertBlock(done, () => {
                    should(err[""]).deepEqual(["NOT A NUMBER"]);
                }));
        });
    });

    describe("for any value", () => {
        const validator = rules.any<Date>(v => new Date(`${v}`) !== undefined, "Invalid date")
            .parse(v => new Date(`${v}`));

        it("must validate correct date", done => {
            validate("2014-11-01", validator)
                .then(v => assertBlock(done, () => {

                    v.getTime().should.equal(new Date("2014-11-01").getTime());
                }))
                .catch(() => done("Must pass!!"));
        });
    })
};