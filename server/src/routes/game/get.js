const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {get: schema} = require("../../data-validations/game/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();

class GetGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.GET, "get");
    }

    async get(req) {
        const validData = validateData(req.query, schema);
        const {id, code} = validData;

        let game;
        if (id) {
            game = await games.getGameById(id);
        } else {
            game = await games.getGameByCode(code);
        }

        if (!game) {
          throw new GameErrors.GameDoesNotExist(validData);
            // return new GameErrors.GameDoesNotExist(validData); //Použití jako warning - ale je lepší udělat novou třídu pro Warning
        }

        //important is only the current players data - so only other players bus stop and 1 card from autobus
        for(let player of game.playerList){
            if(player.userId === req.user.id){
                player.myself = true;
            }else{
                delete player.hand;
                player.bus = [player.bus[0]];//TODO vrátit počet karet v autobusu aby ostatní věděli jak na tom jsou - vrátim celé pole s null a první "poslední" kartou
            }
        }
        return {...game, success: true};
    }
}

module.exports = GetGame;
