const GameErrors = require("../errors/game/game-errors");
const {rankCardOrder, joker}= require("../utils/game-constants");

function validationOfNewDestination(card) {
        if(card.rank !== rankCardOrder[0] && card.rank !== joker) {
            throw new GameErrors.InvalidCardInGameBoard({ card});
        }
}
function validationOfGameBoard(game, gameBoardIndex, card) {
    if (!game.gameBoard[gameBoardIndex]) {
        throw new GameErrors.DestinationDoesNotExist({gameBoardIndex, card});
    }

    if (card.rank !== rankCardOrder[game.gameBoard[gameBoardIndex].length] || card.rank !== joker) {
        throw new GameErrors.InvalidCardInGameBoard({gameBoardIndex, card});
    }

}

module.exports = {
    validationOfNewDestination,
    validationOfGameBoard
}