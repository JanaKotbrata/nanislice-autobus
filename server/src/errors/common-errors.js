class CommonError extends Error {
    constructor(name, message) {
        super();
        this.status = 400;
        this.name = name;
        this.message = message;
    }
}
module.exports = CommonError;