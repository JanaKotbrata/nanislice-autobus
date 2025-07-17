const InvalidDataError = require("../errors/invalid-data")

function validateData(data, schema){
    const { error, value } = schema.validate(data);
    if (error) {
        throw new InvalidDataError(error);
    }
    return value;
}


module.exports = validateData;