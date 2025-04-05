class InvalidDataError extends Error {
    constructor(validationError) {
        super();
        this.status = 400;
        this.name = 'InvalidDataError';
        this.message = validationError.message;
    }
}

module.exports = InvalidDataError;