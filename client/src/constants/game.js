export const EMOTES = [
  { icon: "😊", label: "Smile" },
  { icon: "😍", label: "Love" },
  { icon: "😮", label: "Surprise" },
  { icon: "😢", label: "Sad" },
  { icon: "😂", label: "Laugh" },
  { icon: "😡", label: "Angry" },
  { icon: "😘", label: "Kiss" },
  { icon: "😐", label: "Meh" },
];
export const MESSAGES = [
  { label: "Cheater!", text: "msgCheater" },
  { label: "Vyndej to ESO!", text: "msgCard" },
  { label: "Stačííí!", text: "msgStop" },
  { label: "Dělej! Nezdržůůj!", text: "msgDo" },
  { label: "Dej tam tu kartu!", text: "msgGive" },
  { label: "Hm, dobře ty!", text: "msgGood" },
];
export const CardBgClassMap = {
  classic: {
    RED: "back-card-red",
    BLUE: "back-card-blue",
  },
  witcher: {
    RED: "witcher-card-back--red",
    BLUE: "witcher-card-back--blue",
  },
  harrypotter: {
    RED: "harrypotter-card-back harrypotter-card-back--red",
    BLUE: "harrypotter-card-back harrypotter-card-back--blue",
  },
  flower: {
    RED: "flower-card-back flower-card-back--red",
    BLUE: "flower-card-back flower-card-back--blue",
  },
  flowerdark: {
    RED: "flower-card-back-dark flower-card-dark-back--red",
    BLUE: "flower-card-dark-back flower-card-dark-back--blue",
  },
  deadpool: {
    RED: "deadpool-card-back deadpool-card-back--red",
    BLUE: "deadpool-card-back deadpool-card-back--blue",
  },
  starwars: {
    RED: "starwars-card-back starwars-card-back--red",
    BLUE: "starwars-card-back starwars-card-back--blue",
  },
};
export const CARD = "CARD";
export const DEFAULT_CARD_STYLE = "classic";
export const DEFAULT_GAMEBOARD_COLOR = "#3d5336";
export const InteractionType = {
  EMOTE: "emote",
  MESSAGE: "message",
};
