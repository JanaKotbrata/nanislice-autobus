import React from "react";
import Button from "../../components/form/visual/button.jsx";
import discord from "../../assets/discord.svg";
import Config from "../../../../shared/config/config.json";
function DiscordLogin({ message = "" }) {
  const discordAuthUrl = `${Config.SERVER_URI}/auth/discord`;

  const handleDiscordLogin = () => {
    setTimeout(() => {
      window.location.href = discordAuthUrl;
    }, 0);
  };

  return (
    <Button onClick={() => handleDiscordLogin()}>
      <img className="mr-2" src={discord} alt="logo" />
      <span>{message}</span>{" "}
    </Button>
  );
}

export default DiscordLogin;
