interface ValidationErrors {
    [path: string]: string[];
}

interface ValidationResult<TOut> {
    valid: boolean;
    value: TOut;
    errors?: ValidationErrors;
}

type ReportErrorFunction = (errorMessage: string) => void;

interface ValidateAndTransformFunc<TIn, TOut> {
    (value: TIn, reportError: ReportErrorFunction, entity?: any, rootEntity?: any): any;
}

interface IValidationContext {
    reportError(errorMessage: string): void;
    property(propertyName: string): IValidationContext;
    index(index: number): IValidationContext;
}

interface IValidationRule<TIn, TOut> {
    /**
     * Run validation of the specified value with callback to given context.
     * 
     * param @value The immediate value being validated.
     * param @validationContext The validation context for reporting errors.
     * param @entity The entity which properties are currently validated, may be the nested into root entity.
     * param @root The root entity passed to validator.run method.
     */
    run(value: TIn, validationContext: IValidationContext, entity: any, root: any): TOut;
}



