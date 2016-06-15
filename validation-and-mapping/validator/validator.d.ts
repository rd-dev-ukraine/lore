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


