interface ValidationErrors {
    [path: string]: string[];
}

interface ValidationResult<TOut> {
    valid: boolean;
    value: TOut;
    errors?: ValidationErrors;
}

type ReportErrorFunction = (errorMessage: string) => void;

interface IValidationTransform<TIn, TOut> {
    (value: TIn, reportError: ReportErrorFunction): any;
}


