import Config from "../../../../../shared/config/config.json";
import google from "../../../assets/google.svg";
import Button from "../button.jsx";

function GoogleLogin({ message = "" }) {
  function handleGoogleLogin(e) {
    e.preventDefault();
    const redirectUrl = encodeURIComponent(
      `${Config.CLIENT_URI}/auth-callback`,
    );
    window.location.href = `${Config.SERVER_URI}/auth/google?redirect_uri=${redirectUrl}`;
  }

  return (
    <Button onClick={handleGoogleLogin}>
      <img className="mr-2" src={google || ""} alt="logo" />
      <span>{message}</span>
    </Button>
  );
}
export default GoogleLogin;
