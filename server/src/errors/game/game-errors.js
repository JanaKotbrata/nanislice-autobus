const CommonError = require("./../common-errors");
class GameDoesNotExist extends CommonError {
    constructor(params) {
        super('GameDoesNotExist', "Requested game does not exist");
        this.status = 404;
        this.params = params;
    }
}
class GameIsClosed extends CommonError {
    constructor(params) {
        super('GameIsClosed', "Failed to start game, game is closed");
        this.status = 400;
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

class UserDoesNotExist extends CommonError {
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
class FailedToAddPlayer extends CommonError {
    constructor(params) {
        super('FailedToAddPlayer', "Failed to add player");
        this.status = 500;
        this.params = params;
    }
}
class PlayerAlreadyInGame extends CommonError {
    constructor(params) {
        super('PlayerAlreadyInGame', "Player already in game");
        this.status = 400;
        this.params = params;
    }
}
class PlayerNotInGame extends CommonError {
    constructor(params) {
        super('PlayerNotInGame', "Player is not in game");
        this.status = 400;
        this.params = params;
    }
}
class FailedToRemovePlayer extends CommonError {
    constructor(params) {
        super('FailedToRemovePlayer', "Failed to remove player");
        this.status = 500;
        this.params = params;
    }
}
class UserAlreadyInGame extends CommonError {
    constructor(params) {
        super('UserAlreadyInGame', "User is already in game");
        this.status = 400;
        this.params = params;
    }
}

module.exports = {
    GameDoesNotExist,
    UpdateGameFailed,
    UserDoesNotExist,
    FailedToCreateGame,
    FailedToDeleteGame,
    FailedToAddPlayer,
    PlayerAlreadyInGame,
    PlayerNotInGame,
    FailedToRemovePlayer,
    UserAlreadyInGame,
    GameIsClosed
};