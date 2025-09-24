import seznam from "../../../assets/seznam-cz.png";
import Config from "../../../../../shared/config/config.json";
import LoginButton from "./login-button.jsx";

function SeznamLogin({ message = "", consentGiven = false, onBlockedClick }) {
  return (
    <LoginButton
      message={message}
      icon={seznam}
      loginUrl={`${Config.SERVER_URI}/auth/seznam`}
      consentGiven={consentGiven}
      onBlockedClick={onBlockedClick}
    />
  );
}

export default SeznamLogin;
