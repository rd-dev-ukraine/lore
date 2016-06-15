/// <reference path="./validator.d.ts" />

export class ValidationContext<TValue> {
    constructor(
        public valueToValidate: TValue,
        public path: string,
        private errorAccumulator) {
    }
}