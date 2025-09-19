const {
  initDeck,
  dealCardPerPlayer,
} = require("../../src/services/card-service");
const {
  RANK_CARD_ORDER,
  Roles,
  States,
} = require("../../../shared/constants/game-constants.json");

function generateRandomCode(length = 6) {
  const randomString = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  return randomString
    .split("")
    .map((char, index) => (Math.random() > 0.5 ? char.toUpperCase() : char))
    .join("");
}

function generateRandomId(length = 24) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function generateRandomString() {
  return Math.random().toString(36).substring(2, 10);
}

function generateRandomUrl() {
  return `https://example.com/${generateRandomString()}`;
}

function generateRandomEmail() {
  return `${generateRandomString()}@${generateRandomString()}.com`;
}

function basicUser(params = {}, extraParams = {}) {
  return {
    userId: params.userId || generateRandomId(),
    name: params.name || generateRandomCode(),
    picture: params.picture || generateRandomUrl(),
    role: params.role || Roles.PLEB,
    sys: params.sys || {
      cts: params.cts || new Date().toISOString(),
      mts: params.mts || new Date().toISOString(),
      rev: params.rev || 0,
    },
    ...extraParams,
  };
}

function userMock(params = {}, extraParams = {}) {
  return basicUser(params, {
    googleId: generateRandomId,
    email: generateRandomEmail(),
    ...extraParams,
  });
}

function getPlayerList(playersNumber = 1, player) {
  let playerList = [];
  for (let i = 0; i < playersNumber; i++) {
    const player = basicUser({}, {});
    if (i === 0) {
      player.creator = true;
      player.isCardDrawed = true;
    }
    playerList.push(player);
  }
  if (player) {
    playerList.push(player);
  }
  return playerList;
}

function getPlayerListAndDeck(playersNumber = 1, user, win = false, params) {
  let playerList = getPlayerList(playersNumber, user);

  const deck = initDeck(playerList);
  if (win) {
    playerList[0].bus = [];
  }

  const [cacheDeck, players] = dealCardPerPlayer(
    deck,
    playerList,
    params.handNumber,
    params.busNumber,
  );
  if (params.firstPositionInBusStop) {
    players[players.length - 1].busStop = [
      [{ i: 234561, rank: "2", suit: "<3" }],
      [],
      [],
      [],
    ];
  }
  if (params.fullBusStop) {
    players[players.length - 1].busStop = [
      [{ i: 234561, rank: "2", suit: "<3" }],
      [
        {
          i: 334561,
          rank: "3",
          suit: "<3",
        },
      ],
      [{ i: 434561, rank: "4", suit: "<3" }],
      [{ i: 534561, rank: "5", suit: "<3" }],
    ];
  }
  if (user?.isCardDrawed === false) {
    players[players.length - 1].isCardDrawed = false;
  }
  if (params.preferredRank) {
    const preferredRankCard = deck.find(
      (card) => card.rank === params.preferredRank,
    );
    if (preferredRankCard) {
      players[players.length - 1].hand.push(preferredRankCard);
      const index = deck.findIndex((card) => card.i === preferredRankCard.i);
      deck.splice(index, 1);
    }
  }
  if (params.preferredRankInBus) {
    const preferredRankCard = deck.find(
      (card) => card.rank === params.preferredRankInBus,
    );
    if (preferredRankCard) {
      players[players.length - 1].bus.push(preferredRankCard);
      const index = deck.findIndex((card) => card.i === preferredRankCard.i);
      deck.splice(index, 1);
    }
  }

  return { playerList: players, deck: cacheDeck };
}

function initialGame(params = {}, extraParams = {}) {
  return {
    code: params.code || generateRandomCode(),
    state: params.state || States.INITIAL,
    playerList: params.playerList || getPlayerList(1, params?.user),
    completedCardList: params.completedCardList || [],
    sys: params.sys || {
      cts: params.cts || new Date().toISOString(),
      mts: params.mts || new Date().toISOString(),
      rev: params.rev || 0,
    },
    ...extraParams,
  };
}

function activeGame(params = {}, extraParams) {
  const { playerList, deck } = getPlayerListAndDeck(
    params?.numberOfPlayers,
    params.user,
    params?.win,
    {
      handNumber: params.handNumber,
      preferredRank: params.preferredRank,
      preferredRankInBus: params.preferredRankInBus,
      firstPositionInBusStop: params.firstPositionInBusStop,
      fullBusStop: params.fullBusStop,
    },
  );
  let gameBoard = params.gameBoard || [];
  if (!params.gameBoard) {
    const ase = deck.find((card) => card.rank === RANK_CARD_ORDER[0]);
    const index = deck.findIndex((c) => c.i === ase.i);
    deck.splice(index, 1);
    gameBoard.push([ase]);
  }
  return initialGame(
    {
      playerList,
      ...params,
      state: params.state || States.ACTIVE,
      rev: params.rev || 1,
    },
    {
      ...extraParams,
      gameBoard,
      deck,
      currentPlayer:
        params.currentPlayer || params.currentPlayer === 0
          ? params.currentPlayer
          : 1,
    },
  );
}

function closedGame(params = {}, extraParams = {}) {
  return activeGame(
    { win: true, state: States.CLOSED, rev: params.rev || 2, ...params },
    extraParams,
  );
}

function finishedGame(params = {}, extraParams = {}) {
  return activeGame(
    { win: true, state: States.FINISHED, rev: params.rev || 2, ...params },
    extraParams,
  );
}

module.exports = {
  initialGame,
  activeGame,
  closedGame,
  basicUser,
  userMock,
  generateRandomId,
  generateRandomCode,
  getPlayerList,
  finishedGame,
};
