"use strict";
// import { validate, obj, objOptional, str, num, hash, hashOptional } from "../validator";
// export default () => {
//     describe("for numbers hash", () => {
//         const numbersHash = hash(
//             num().required().must(n => n > 0 && n < 10)
//         );
//         it("must pass valid numbers", () => {
//             const validHash = {
//                 one: 1,
//                 two: 2,
//                 three: 3,
//                 four: 4
//             };
//             const result = validate(validHash, numbersHash);
//             result.valid.should.be.true();
//             result.value.should.deepEqual(validHash);
//         });
//         it("must fail on invalid numbers", () => {
//             const invalidHash = {
//                 one: 1,
//                 two: 2,
//                 three: "three"
//             };
//             const result = validate(invalidHash, numbersHash);
//             result.valid.should.be.false();
//             should(result.errors["three"][0]).equal("Value is not a valid number");
//         });
//         it("must not fail and skip invalid if configured", () => {
//             const numbersHashWithSkip = hash(
//                 num().required().must(n => n > 0 && n < 10)
//             ).keepOnlyValid();
//             const invalidHash = {
//                 one: 1,
//                 two: 2,
//                 three: "three"
//             };
//             const result = validate(invalidHash, numbersHashWithSkip);
//             result.valid.should.be.true();
//             result.value.should.deepEqual({
//                 one: 1,
//                 two: 2
//             });
//         });
//     });
//     describe("for objects hash", () => {
//         const objectHash = hash(
//             obj({
//                 id: num().required(),
//                 title: str().required()
//             })
//         );
//         it("must pass on valid hash", () => {
//             const validHash = {
//                 "1": {
//                     id: 1,
//                     title: "one"
//                 },
//                 "2": {
//                     id: 2,
//                     title: "two"
//                 }
//             };
//             const result = validate<any, any>(validHash, objectHash);
//             result.valid.should.be.true();
//             result.value.should.deepEqual(validHash);
//         });
//     });
// }; 
//# sourceMappingURL=hash-validator-test.js.map