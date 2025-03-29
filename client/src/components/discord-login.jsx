import React, { useEffect } from "react";
import axios from "axios";
import Button from "./form/visual/button.jsx";
import discord from "../assets/discord.svg";
import config from "../../../shared/config/config.json";

const DiscordLogin = () => {
  const clientId = config.discord.client_id;
  //const redirectUri = "http://localhost:5173/"; //FIXME
  const redirectUri = "http://localhost:1234/auth/discord/callback"; //FIXME
  const scope = "identify email"; // Požadované scope
  //Když bych to použila stejně jako u google bez knihovny pro získání tokenu,ale rovnou bych zavolala api mojí aplikace, která to vyrobí, tak tady clienId nepotřebuju
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=token&scope=${encodeURIComponent(scope)}`;

  const handleDiscordLogin = () => {
    // Přesměrování na Discord OAuth stránku

    // ciste v onClick nefungovalo presmerovani, mozna nejaky even handling v prohlizeci
    setTimeout(() => {
      window.location.href = discordAuthUrl;
    }, 0);
  };

  const getUserInfo = async (accessToken) => {
    try {
      // Zavoláme Discord API pro získání uživatelských dat
      const response = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("User data:", response.data);
      alert(`Logged user: ${response.data.username}`);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        getUserInfo(accessToken);
      }
    }
  }, []);

  return (
    <Button onClick={() => handleDiscordLogin()}>
      <img className="mr-2" src={discord} alt="logo" />
      <span>Continue with Discord</span>{" "}
    </Button>
  );
};

export default DiscordLogin;
