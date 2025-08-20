import React from "react";
import Button from "../button.jsx";
import seznam from "../../../assets/seznam-cz.png";
import Config from "../../../../../shared/config/config.json";

function SeznamLogin({ message = "", consentGiven = false, onBlockedClick }) {
  function handleSeznamLogin(e) {
    e.preventDefault();
    if (!consentGiven) {
      onBlockedClick?.();
      return;
    }
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
