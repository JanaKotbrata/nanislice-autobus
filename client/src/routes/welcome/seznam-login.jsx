import React from "react";
import Button from "../../components/form/visual/button.jsx";
import seznam from "../../assets/seznam-cz.png";
import Config from "../../../../shared/config/config.json";

function SeznamLogin({ message = "" }) {
  function handleSeznamLogin(e) {
    e.preventDefault();
    const redirectUrl = encodeURIComponent(
      `${Config.CLIENT_URI}/auth-callback`,
    );
    window.location.href = `${Config.SERVER_URI}/auth/seznam`;
  }

  return (
    <Button onClick={(e) => handleSeznamLogin(e)}>
      <img className="mr-2" src={seznam} alt="logo" />
      <span>{message}</span>
    </Button>
  );
}

export default SeznamLogin;
