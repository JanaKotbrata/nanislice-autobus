const CommonError = require("../common-errors");

class UserNotAuthenticated extends CommonError {
  constructor(params) {
    super("UserNotAuthenticated", "User is not authenticated");
    this.status = 401;
    this.params = params;
  }
}

class UserDoesNotExist extends CommonError {
  constructor(params) {
    super("UserDoesNotExist", "Requested user does not exist");
    this.status = 404;
    this.params = params;
  }
}

class AvatarNotFound extends CommonError {
  constructor(params) {
    super("AvatarNotFound", "Default avatar not found for user");
    this.status = 404;
    this.params = params;
  }
}

class FailToDownloadAvatar extends CommonError {
  constructor(params) {
    super("FailToDownloadAvatar", "Failed to download avatar");
    this.status = 500;
    this.params = params;
  }
}

class UserUpdateFailed extends CommonError {
  constructor(params) {
    super("UserUpdateFailed", "Failed to update user");
    this.status = 500;
    this.params = params;
  }
}
class UserNotAuthorized extends CommonError {
  constructor(params) {
    super("UserNotAuthorized", "User is not authorized to perform this action");
    this.status = 403;
    this.params = params;
  }
}

module.exports = {
  UserNotAuthenticated,
  UserDoesNotExist,
  AvatarNotFound,
  UserUpdateFailed,
  FailToDownloadAvatar,
  UserNotAuthorized,
};
