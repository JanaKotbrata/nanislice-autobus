import google from "../../../assets/google.svg";
import Config from "../../../../../shared/config/config.json";
import LoginButton from "./login-button.jsx";

function GoogleLogin({ message = "", consentGiven = false, onBlockedClick }) {
  return (
    <LoginButton
      message={message}
      icon={google}
      loginUrl={`${Config.SERVER_URI}/auth/google`}
      consentGiven={consentGiven}
      onBlockedClick={onBlockedClick}
      useRedirectParam={true}
    />
  );
}

export default GoogleLogin;
