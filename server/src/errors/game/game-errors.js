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
class GameIsNotActive extends CommonError {
    constructor(params) {
        super('GameIsNotActive', "Game has to be in active state.");
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

class UserNotInGame extends CommonError {
    constructor(params) {
        super('UserNotInGame', "User is not in game");
        this.status = 400;
        this.params = params;
    }
}

class FailedToUpdateGame extends CommonError {
    constructor(params) {
        super('FailedToUpdateGame', "Failed to update game");
        this.status = 500;
        this.params = params;
    }
}
class InvalidCardInBusStop extends CommonError {
    constructor(params) {
        super('InvalidCardInBusStop', "Invalid card in bus stop");
        this.status = 400;
        this.params = params;
    }
}
class DestinationDoesNotExist extends CommonError {
    constructor(params) {
        super('DestinationDoesNotExist', "Destination does not exist");
        this.status = 400;
        this.params = params;
    }
}
class InvalidCardInGameBoard extends CommonError {
    constructor(params) {
        super('InvalidCardInGameBoard', "Invalid card in game board");
        this.status = 400;
        this.params = params;
    }
}
class CardDoesNotExist extends CommonError {
    constructor(params) {
        super('CardDoesNotExist', "Card does not exist");
        this.status = 400;
        this.params = params;
    }
}
class ActionIsNotDefined extends CommonError {
    constructor(params) {
        super('ActionIsNotDefined', "Action is not defined");
        this.status = 400;
        this.params = params;
    }
}
class InvalidHandReorder extends CommonError {
    constructor(params) {
        super('InvalidHandReorder', "Invalid hand reorder");
        this.status = 400;
        this.params = params;
    }
}
class InvalidBusStopIndex extends CommonError {
    constructor(params) {
        super('InvalidBusStopIndex', "Invalid bus stop index");
        this.status = 400;
        this.params = params;
    }
}
class InvalidHandLength extends CommonError {
    constructor(params) {
        super('InvalidHandLength', "Invalid hand length");
        this.status = 400;
        this.params = params;
    }
}
class UserIsNotCurrentPlayer extends CommonError {
    constructor(params) {
        super('UserIsNotCurrentPlayer', "User is not current player");
        this.status = 400;
        this.params = params;
    }
}
class NotPossibleToDraw extends CommonError {
    constructor(params) {
        super('NotPossibleToDraw', "Not possible to draw card");
        this.status = 400;
        this.params = params;
    }
}
class PlayerMustDrawCardFirst extends CommonError {
    constructor(params) {
        super('PlayerMustDrawCardFirst', "Player must draw a card first");
        this.status = 400;
        this.params = params;
    }
}
module.exports = {
    GameDoesNotExist,
    GameIsNotActive,
    UpdateGameFailed,
    UserDoesNotExist,
    FailedToCreateGame,
    FailedToDeleteGame,
    FailedToAddPlayer,
    PlayerAlreadyInGame,
    PlayerNotInGame,
    FailedToRemovePlayer,
    UserAlreadyInGame,
    GameIsClosed,
    UserNotInGame,
    FailedToUpdateGame,
    InvalidCardInBusStop,
    DestinationDoesNotExist,
    InvalidCardInGameBoard,
    CardDoesNotExist,
    ActionIsNotDefined,
    InvalidHandReorder,
    InvalidBusStopIndex,
    InvalidHandLength,
    UserIsNotCurrentPlayer,
    NotPossibleToDraw,
    PlayerMustDrawCardFirst
};