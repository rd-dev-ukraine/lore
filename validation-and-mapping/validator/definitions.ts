/**
 * Structure contains validation errors with results of validation.
 * The validation errors contained in dictionary where key is path to validated value
 * which may includes property access and indexer operations.
 * 
 * Also validation errors may contains optonal summary message with empty-string key describes object-wide errors.
 */
export interface ValidationErrorHash {
    /** Object-wide validation messages. */
    [""]?: string[];
    /** Validation messages for properties and indexes of object, including ones with more than one nesting level. */
    [path: string]: string[];
}

/** 
 * Result of validation and conversion. 
 * @convertedValue is not null only if validation is passed.
 */
export interface ValidationResult<T> {
    /** Gets a value indicates whether validation and conversion was successful. */
    valid: boolean;
    /** Gets the converted value. If validation failed the converted value is null. */
    convertedValue?: T;
    /** Errors messages for object and it's content. If validation was successful the errors is null. */
    errors?: ValidationErrorHash;
}

/**
 * Validation context allows reporting errors for current validation stage and
 * creation nested context of different type.
 */
export interface IValidationContext {
    /** Writes an error message to error accumulator for this context. */
    reportError(errorMessage: string): void;
    /** Creates nested validation context represents property of the object. */
    property(propertyName: string, errorCallback?: (errorMessage: string) => boolean): IValidationContext;
    /** Creates nested validation context represents array element access by index. */
    index(index: number, errorCallback?: (errorMessage: string) => boolean): IValidationContext;
}

/**
 * Represents a single piece of validation logic.
 */
export interface ValidationRule<T> {

    /**
     * Run validation logic on specified input value.
     * 
     * param @context Validation context allows report errors for current value and create context for nested validation.
     * param @done Callback called when validation and conversion is completed. 
     *             Accepts convertedValue or null if conversion failed and success parameter indicates whether conversion was successful. 
     * param @inputValue Input value to validate and convert.
     * param @validatingObject Object which property or element being validated currently.
     * param @rootObject Object on which validation was run.
     */
    run(context: IValidationContext,
        done: (convertedValue: T, success: boolean) => void,
        inputValue: any,
        validatingObject?: any,
        rootObject?: any): void;
}