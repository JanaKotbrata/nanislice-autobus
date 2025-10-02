import { InteractionType } from "../../../constants/game.js";

function InteractCloud({ emote = "", visible = true }) {
  if (!visible || !emote) return null;
  let icons = [];
  if (typeof emote === "string") {
    icons = [emote, emote, emote];
  } else if (emote.type === InteractionType.MESSAGE) {
    icons = [emote.text];
  } else if (
    emote.type === InteractionType.EMOTE &&
    Array.isArray(emote.emotes)
  ) {
    icons = emote.emotes;
  }
  if (!icons.length) return null;
  return (
    <div className="absolute left-1/2 top-2 z-10 flex gap-2 -translate-x-1/2 pointer-events-none emote-levitate">
      {icons.map((icon, i) => (
        <span className={InteractionType.EMOTE} key={i}>
          {icon}
        </span>
      ))}
    </div>
  );
}

export default InteractCloud;
