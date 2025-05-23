function transformCurrentPlayerData(game, userId) { //TODO vrátit deck bez dat :))
    for(let player of game.playerList){
        if(player.userId === userId){
            player.myself = true;
        }else{
            delete player.hand;
            player.bus = [player.bus[0]];//TODO vrátit počet karet v autobusu aby ostatní věděli jak na tom jsou - vrátim celé pole s null a první "poslední" kartou
        }
    }
}

module.exports = {  transformCurrentPlayerData };