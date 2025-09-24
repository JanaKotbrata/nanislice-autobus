import discord from "../../../assets/discord.svg";
import Config from "../../../../../shared/config/config.json";
import LoginButton from "./login-button.jsx";

function DiscordLogin({ message = "", consentGiven = false, onBlockedClick }) {
  return (
    <LoginButton
      message={message}
      icon={discord}
      loginUrl={`${Config.SERVER_URI}/auth/discord`}
      consentGiven={consentGiven}
      onBlockedClick={onBlockedClick}
    />
  );
}

export default DiscordLogin;
