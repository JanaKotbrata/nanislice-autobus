import React from "react";
import Button from "../../components/form/visual/button.jsx";
import discord from "../../assets/discord.svg";

const DiscordLogin = () => {
  const discordAuthUrl = `http://localhost:1234/auth/discord`; //FIXME in cloud

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
