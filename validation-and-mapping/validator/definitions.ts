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

export interface RuleOptions {
    errorMessage?: string;
    stopOnFailure?: boolean; 
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
 * 
 * Each validation rule consists of two stages - parsing and validation.
 * Parsing is sync and must converts the type of the input value.
 * Validation is optionally async and should checks parsed value for validity.
 * 
 * Parsing stage is unable to report errors. Instead it should return a value recognizable by validation stage and report errors there. 
 * 
 * Validation stage receives parsed value. 
 * If value is complex like object or array the parsing should be performed on whole object before validation.
 * This enables to pass parsed values as validatingObject parameter. 
 */
export interface ValidationRule<T> {
    /**
     * Gets a value determines whether next rules must be run if current rules failed validation stage.
     */
    stopOnFailure: boolean;

    /**
     * Parse value before performing a validation.
     * If parsing is failed it should return some value recognizable by the validate method.
     * 
     */
    runParse(inputValue: any, validatingObject?: any, rootObject?: any): T;

    /**
     * Run validation logic on specified input value.
     * 
     * param @context Validation context allows report errors for current value and create context for nested validation.
     * param @doneCallback Callback called when validation is completed. 
     *             Accepts boolean value determines whether conversion was successful. 
     * param @parsedValue Parsed value returned by parsing stage.
     * param @validatingObject Object which property or element being validated currently.
     * param @rootObject Object on which validation was run.
     */
    runValidate(context: IValidationContext,
        doneCallback: (success: boolean) => void,
        parsedValue: any,
        validatingObject?: any,
        rootObject?: any): void;
}