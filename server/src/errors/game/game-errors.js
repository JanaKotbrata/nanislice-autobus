class CommonError extends Error {
    constructor(name, message) {
        super();
        this.status = 400;
        this.name = name;
        this.message = message;
    }
}

class GameDoesNotExistError extends CommonError {
    constructor(params) {
        super('GameDoesNotExist', "Requested game does not exist");
        this.status = 404;
        this.params = params;
    }
}

class UpdateGameFailed extends CommonError {
    constructor(params) {
        super('UpdateGameFailed', "Failed to update game");
        this.status = 500;
        this.params = params;
    }
}

class UserDoesNotExistError extends CommonError {
    constructor(params) {
        super('UserDoesNotExist', "Requested user does not exist");
        this.status = 404;
        this.params = params;
    }
}

class FailedToCreateGame extends CommonError {
    constructor(params) {
        super('FailedToCreateGame', "Failed to create game");
        this.status = 500;
        this.params = params;
    }
}

class FailedToDeleteGame extends CommonError {
    constructor(params) {
        super('FailedToDeleteGame', "Failed to delete game");
        this.status = 500;
        this.params = params;
    }
}
class FailedToAddPlayerError extends CommonError {
    constructor(params) {
        super('FailedToAddPlayerError', "Failed to add player");
        this.status = 500;
        this.params = params;
    }
}
class PlayerAlreadyInGameError extends CommonError {
    constructor(params) {
        super('PlayerAlreadyInGameError', "Player already in game");
        this.status = 400;
        this.params = params;
    }
}
class PlayerNotInGameError extends CommonError {
    constructor(params) {
        super('PlayerNotInGameError', "Player is not in game");
        this.status = 400;
        this.params = params;
    }
}
class FailedToRemovePlayerError extends CommonError {
    constructor(params) {
        super('FailedToRemovePlayerError', "Failed to remove player");
        this.status = 500;
        this.params = params;
    }
}

module.exports = {
    GameDoesNotExistError,
    UpdateGameFailed,
    UserDoesNotExistError,
    FailedToCreateGame,
    FailedToDeleteGame,
    FailedToAddPlayerError,
    PlayerAlreadyInGameError,
    PlayerNotInGameError,
    FailedToRemovePlayerError
};