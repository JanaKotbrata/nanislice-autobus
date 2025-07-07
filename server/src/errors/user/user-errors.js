const CommonError = require("../common-errors");

class UserNotAuthenticatedError extends CommonError {
    constructor(params) {
        super('UserNotAuthenticatedError', "User is not authenticated");
        this.status = 404;
        this.params = params;
    }
}
class UserDoesNotExist extends CommonError {
    constructor(params) {
        super('UserDoesNotExist', "Requested user does not exist");
        this.status = 404;
        this.params = params;
    }
}
class AvatarNotFound extends CommonError {
    constructor(params) {
        super('AvatarNotFound', "Avatar not found for user");
        this.status = 404;
        this.params = params;
    }
}
class FailToDownloadAvatar extends CommonError {
    constructor(params) {
        super('FailToDownloadAvatar', "Failed to download avatar");
        this.status = 500;
        this.params = params;
    }
}


module.exports = {
    UserNotAuthenticatedError,
    UserDoesNotExist,
    AvatarNotFound,
    FailToDownloadAvatar
}