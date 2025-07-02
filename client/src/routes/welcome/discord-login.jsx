import React from "react";
import Button from "../../components/form/visual/button.jsx";
import discord from "../../assets/discord.svg";
import Config from "../../../../shared/config/config.json";
const DiscordLogin = () => {
  const discordAuthUrl = `${Config.SERVER_URI}/auth/discord`;

  const handleDiscordLogin = () => {
    // ciste v onClick nefungovalo presmerovani, mozna nejaky even handling v prohlizeci
    setTimeout(() => {
      window.location.href = discordAuthUrl;
    }, 0);
  };

  return (
    <Button onClick={() => handleDiscordLogin()}>
      <img className="mr-2" src={discord} alt="logo" />
      <span>Continue with Discord</span>{" "}
    </Button>
  );
};

export default DiscordLogin;
