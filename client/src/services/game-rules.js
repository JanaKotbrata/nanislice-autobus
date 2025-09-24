import commonJsData from "../../../shared/validation/game-rules.js";
import GameRulesErrors from "../../../shared/constants/game-rules-errors.json";
import { GameError } from "../errors/game-error.js";
const { CommonGameRules } = commonJsData;

const NO_PARAMS_ERROR = new Set([
  GameRulesErrors.PlayerMustDrawCardFirst,
  GameRulesErrors.NotPossibleToDraw,
  GameRulesErrors.InvalidHandLength,
  GameRulesErrors.BusJrFirst,
  GameRulesErrors.FirstPlaceError,
]);

const CARD_PARAMS_ERROR = new Set([GameRulesErrors.PlaceRankError]);

export class ClientGameRules extends CommonGameRules {
  constructor(game) {
    super(game);
  }

  throwError(errorKey, ...params) {
    const errorsMapping = {
      [GameRulesErrors.NotYourTurn]: "notYourTurn",
      [GameRulesErrors.PlayerMustDrawCardFirst]: "drawCard",
      [GameRulesErrors.AlreadyPlaced]: "alreadyPlaced",
      [GameRulesErrors.WrongPlace]: "wrongPlace",
      [GameRulesErrors.BusStopError]: "busStopError",
      [GameRulesErrors.WrongPlaceInBusStop]: "wrongPlaceInBusStop",
      [GameRulesErrors.InvalidBusStopIndex]: "invalidBusStopIndex",
      [GameRulesErrors.PlaceError]: "placeError",
      [GameRulesErrors.InvalidHandReorder]: "placeInHandError",
      [GameRulesErrors.InvalidHandLength]: "notPossibleDraw",
      [GameRulesErrors.NotPossibleToDraw]: "notPossibleDraw",
      [GameRulesErrors.BusJrFirst]: "busJrFirst",
      [GameRulesErrors.FirstPlaceError]: "firstPlaceError",
      [GameRulesErrors.PlaceRankError]: "placeRankError",
      [GameRulesErrors.InvalidBusCard]: "dontCheatInBus",
    };
    const messageCode = errorsMapping[errorKey];
    if (!messageCode) {
      throw new Error(`Unknown error key: ${errorKey}`);
    }
    let passParams = [...params];
    if (NO_PARAMS_ERROR.has(errorKey)) {
      passParams = [];
    } else if (CARD_PARAMS_ERROR.has(errorKey)) {
      passParams = [params[0]?.card?.rank];
    }
    throw new GameError(errorsMapping[errorKey], ...passParams);
  }

  reorderHand({ myself, card, targetIndex }) {
    const oldIndex = myself.hand.findIndex((c) => c.i === card.i);
    if (
      oldIndex === -1 ||
      targetIndex < 0 ||
      targetIndex >= myself.hand.length
    ) {
      this.throwError(GameRulesErrors.InvalidHandReorder);
    }

    const newHand = [...myself.hand];
    const movedCard = newHand[oldIndex];
    newHand[oldIndex] = newHand[targetIndex];
    newHand[targetIndex] = movedCard;
    this.hand = newHand;
  }
}
