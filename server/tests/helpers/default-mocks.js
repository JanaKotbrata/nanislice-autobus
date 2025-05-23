const {initDeck, dealCardPerPlayer} = require("../../src/services/card-service");

function generateRandomCode(length = 6) {
    const randomString = Math.random().toString(36).substring(2, 2 + length);
    return randomString.split('')
        .map((char, index) => Math.random() > 0.5 ? char.toUpperCase() : char)
        .join('');
}

function generateRandomId(length=24) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}
function generateRandomString(){
   return Math.random().toString(36).substring(2, 10);
}
function generateRandomUrl() {
    return `https://example.com/${generateRandomString()}`;
}
function generateRandomEmail() {
    return `${generateRandomString()}@${generateRandomString()}.com`;
}
function basicUser(params = {}, extraParams = {}) {
    return {userId: params.userId || generateRandomId() , name:params.name || generateRandomCode(), picture: params.picture || generateRandomUrl() , ...extraParams};
}
function userMock(params = {}, extraParams = {}) {
    return basicUser(params, {googleId: generateRandomId, email:generateRandomEmail(),...extraParams});
}
function getPlayerList(playersNumber = 1, player){
    let playerList = [];
    for (let i = 0; i < playersNumber; i++) {
        const player = basicUser({}, {});
        if (i === 0) {
            player.creator = true;
            player.isCardDrawed = true;
        }
        playerList.push(player);
    }
    if(player){
        playerList.push(player);
    }
    return playerList;
}

function getPlayerListAndDeck(playersNumber = 1, user, win = false) {
    let playerList = getPlayerList(playersNumber, user)

    const deck = initDeck(playerList);
    if(win) {
        playerList[0].bus = [];
    }
    const  [cacheDeck, players] = dealCardPerPlayer(deck, playerList);
    return {playerList: players, deck:cacheDeck};
}


function initialGame(params = {}, extraParams = {}) {
    return {
        code:  params.code || generateRandomCode(),
        state: params.initial || "initial",
        playerList:params.playerList || getPlayerList(1, params?.user),
        ...extraParams
    };
}

function activeGame(params = {}, extraParams) {
const {playerList, deck} =  getPlayerListAndDeck(params?.numberOfPlayers , params.user, params?.win);
    return initialGame({
        playerList,
        ...params,
        state: "active",
    }, {
        ...extraParams, deck,currentPlayer: params.currentPlayer ||  0
    });
}

function closedGame(params = {}, extraParams = {}) {
    return activeGame({win:true,state:"closed", ...params}, extraParams);
}

module.exports = {
    initialGame,
    activeGame,
    closedGame,
    basicUser,
    userMock,
    generateRandomId,
    generateRandomCode
}