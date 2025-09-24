import Button from "../button.jsx";
import Config from "../../../../../shared/config/config.json";

/**
 * Universal login button
 * @param {string} message - Text to display
 * @param {string} icon - Path to icon image
 * @param {string} loginUrl - URL to redirect to (can be function for dynamic)
 * @param {boolean} consentGiven - Whether consent is given
 * @param {function} onBlockedClick - Callback if consent not given
 * @param {boolean} [useRedirectParam] - If true, adds redirect_uri param from CLIENT_URI
 */
function LoginButton({
  message = "",
  icon,
  loginUrl,
  consentGiven = false,
  onBlockedClick,
  useRedirectParam = false,
  ...rest
}) {
  function handleLogin(e) {
    if (e) e.preventDefault();
    if (!consentGiven) {
      onBlockedClick?.();
      return;
    }
    let url = loginUrl;
    if (typeof loginUrl === "function") {
      url = loginUrl();
    }
    if (useRedirectParam) {
      // loginUrl should be a function that returns base url
      const redirectUrl = encodeURIComponent(
        `${Config.CLIENT_URI}/auth-callback`,
      );
      url = `${url}?redirect_uri=${redirectUrl}`;
    }
    window.location.href = url;
  }

  return (
    <Button onClick={handleLogin} {...rest}>
      {icon && <img className="mr-2" src={icon} alt="logo" />}
      <span>{message}</span>
    </Button>
  );
}

export default LoginButton;
