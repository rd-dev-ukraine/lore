import * as assert from "assert";

import primitiveTypesValidatorTest from "./primitive-types-validator-test";
import objectValidatorTest from "./object-validator-test";
import ruleSequenceTest from "./rule-sequence-test";
import hashValidatorTest from "./hash-validator-test";
import arrayValidatorTest from "./array-validator-test";

describe("Primitive values validator", primitiveTypesValidatorTest);
describe("Object validator", objectValidatorTest);
describe("Rule sequence", ruleSequenceTest);
describe("Hash validator", hashValidatorTest);
describe("Array validator", arrayValidatorTest);
