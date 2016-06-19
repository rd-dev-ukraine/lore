import { ValidationRule, IValidationContext } from "../definitions";
import { EnclosingValidationRuleBase } from "./rules-base";


export class ArrayValidationRuleCore<TElement> implements ValidationRule<TElement[]> {

    constructor(
        private elementValidationRule: ValidationRule<TElement>,
        private skipInvalidElements: boolean,
        private filterElementFn: (element: TElement, index?: number) => boolean,
        public stopOnFailure: boolean) {

        if (!elementValidationRule) {
            throw new Error("Element validator is required.");
        }
    }

    runParse(array: any[], validatingObject?: any, rootObject?: any): TElement[] {
        if (array === null || array === undefined) {
            return array;
        }
        // We don't filter array elements here because we need to keep source indexes in validation context errors.
        return array.map(e => this.elementValidationRule.runParse(e, array, rootObject));
    }

    runValidate(
        context: IValidationContext,
        doneCallback: (success: boolean) => void,
        array: any[],
        validatingObject?: any,
        rootObject?: any): void {

        let srcIndex = 0;
        let srcLength = array.length;
        let index = 0;

        let valid = true;

        const run = () => {
            if (srcIndex < srcLength) {

                const element = array[index];

                if (this.filterElementFn && !this.filterElementFn(element, srcIndex)) {
                    array.splice(index, 1);
                    srcIndex++;

                    run();
                }
                else {
                    const elementContext = context.index(srcIndex).bufferErrors();

                    this.elementValidationRule.runValidate(
                        elementContext,
                        success => {
                            if (this.skipInvalidElements) {
                                if (!success) {
                                    array.splice(index, 1);
                                }
                                else {
                                    index++;
                                }
                            }
                            else {
                                elementContext.flushErrors();

                                valid = valid && success;
                                index++;
                            }

                            srcIndex++;
                            run();
                        },
                        element,
                        array,
                        rootObject);
                }
            }
            else {
                doneCallback(valid);
            }
        }

        run();
    }
}

export class ArrayValidationRule<TElement> extends EnclosingValidationRuleBase<TElement[]> {

    constructor(
        private elementValidationRule: ValidationRule<TElement>,
        private skipInvalidElementsProp: boolean,
        private filterElementFn: (element: TElement, index?: number) => boolean,
        private stopOnMainRuleFailure) {

        super(new ArrayValidationRuleCore<TElement>(
            elementValidationRule,
            skipInvalidElementsProp,
            filterElementFn,
            stopOnMainRuleFailure));
    }

    protected clone(): this {
        return <this>new ArrayValidationRule<TElement>(
            this.elementValidationRule,
            this.skipInvalidElementsProp,
            this.filterElementFn,
            this.stopOnMainRuleFailure);
    }

    /**
     * Don't fail on invalid element. Instead don't include invalid elements in result array.
     * Note new rule never fails instead it returns empty array.
     */
    skipInvalidElements(skipInvalidElements = true): this {
        this.skipInvalidElementsProp = skipInvalidElements;

        return this.makeCopy();
    }

    /** Filter result array by applying predicate to each hash item and include only items passed the test. */
    filter(predicate: (element: TElement, index?: number) => boolean): this {
        if (!predicate) {
            throw new Error("Predicate is required.");
        }

        this.filterElementFn = predicate;
        return this.makeCopy();
    }

    private makeCopy(): this {
        return this.withMainRule(new ArrayValidationRule<TElement>(
            this.elementValidationRule,
            this.skipInvalidElementsProp,
            this.filterElementFn,
            this.stopOnMainRuleFailure));
    }
}

/** Validates an array of the elements with the same structure. */
export function arr<TElement>(elementValidationRule: ValidationRule<TElement>, stopOnFailure = true): ArrayValidationRule<TElement> {
    if (!elementValidationRule) {
        throw new Error("Element validation rule is required.");
    }

    return new ArrayValidationRule<TElement>(
        elementValidationRule,
        false,
        null,
        stopOnFailure);
}
