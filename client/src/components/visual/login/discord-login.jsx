import React from "react";
import Button from "../button.jsx";
import discord from "../../../assets/discord.svg";
import Config from "../../../../../shared/config/config.json";

function DiscordLogin({ message = "", consentGiven = false, onBlockedClick }) {
  const discordAuthUrl = `${Config.SERVER_URI}/auth/discord`;

  function handleDiscordLogin() {
    if (!consentGiven) {
      onBlockedClick?.();
      return;
    }
    setTimeout(() => {
      window.location.href = discordAuthUrl;
    }, 0);
  }

  return (
    <Button onClick={() => handleDiscordLogin()}>
      <img className="mr-2" src={discord} alt="logo" />
      <span>{message}</span>{" "}
    </Button>
  );
}

export default DiscordLogin;
