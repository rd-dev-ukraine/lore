import { ValidationRule, IValidationContext } from "../definitions";


export class ArrayValidationRuleCore<TElement> implements ValidationRule<TElement[]> {

    constructor(
        private elementValidationRule: ValidationRule<TElement>,
        private skipInvalidElements: boolean,
        private filterElementFn: (element: TElement, index?: number) => boolean) {

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
        let index = 0;

        let valid = true;
        const run = () => {
            if (index < array.length) {

                const element = array[index];

                if (this.filterElementFn && !this.filterElementFn(element, srcIndex)) {
                    array.splice(index, 1);
                    srcIndex++;
                }
                else {
                    const elementContext = context.index(srcIndex);

                    this.elementValidationRule.runValidate(
                        elementContext,
                        success => {
                            if (this.skipInvalidElements) {
                                if (!success) {
                                    array.splice(index, 1);
                                }
                            }
                            else {
                                valid = valid && success;
                                index++;
                            }

                            srcIndex++;
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

