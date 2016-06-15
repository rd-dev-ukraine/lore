interface ValidationErrors {
    [path: string]: string[];
}

interface ValidationResult {
    valid: boolean;
    errors: ValidationErrors;
}

