import { useContext, useState } from "react";
import nanislice from "../assets/nanislice.svg";
import DiscordLogin from "../components/visual/login/discord-login.jsx";
import GoogleLogin from "../components/visual/login/google-login.jsx";
import SeznamLogin from "../components/visual/login/seznam-login.jsx";
import LanguageContext from "../context/language.js";
import PageContainer from "../components/visual/page-container.jsx";

function Welcome() {
  const i18n = useContext(LanguageContext);
  const [consentGiven, setConsentGiven] = useState(false);
  const [attemptedClick, setAttemptedClick] = useState(false);

  const header = (
    <div className="flex items-center justify-between px-10 pt-8 pb-6 border-b border-cyan-700/30 bg-gray-950/60 rounded-t-3xl shadow-md">
      <a href="/about" className="flex items-center gap-4 hover:opacity-80">
        <img src={nanislice} alt="Nanislice logo" className="w-12 h-12" />
        <span className="text-2xl font-bold tracking-wide text-white drop-shadow">
          nanislice-autobus
        </span>
      </a>
    </div>
  );

  return (
    <PageContainer showVolume={false} header={header}>
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 md:p-10 space-y-6 flex flex-col items-center">
        <h1 className="text-2xl sm:text-xl md:text-3xl font-bold leading-tight tracking-tight text-white text-center">
          {i18n.translate("signIn")}
        </h1>
        <form className="space-y-6 w-full" action="#">
          <p className="text-base sm:text-sm md:text-lg text-gray-400 text-center">
            {i18n.translate("welcomeTitle")}
          </p>
          <hr className="h-px my-8 sm:my-6 md:my-10 bg-cyan-400/50 border-cyan-400/50 border-1" />
          {!consentGiven && attemptedClick && (
            <p className="text-sm text-red-400 mt-3 text-center">
              {i18n.translate("consentWarning")}
            </p>
          )}
          <div className="flex items-start justify-center gap-3 mt-6">
            <input
              id="privacy-consent"
              type="checkbox"
              className="w-5 h-5 mt-1 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
              checked={consentGiven}
              onChange={(e) => {
                setConsentGiven(e.target.checked);
                if (e.target.checked) setAttemptedClick(false);
              }}
            />
            <label
              htmlFor="privacy-consent"
              className="ml-2 text-base sm:text-sm md:text-base text-gray-300"
            >
              {i18n.translate("consentWith")}
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-cyan-400 hover:underline font-semibold ml-1"
              >
                {i18n.translate("consent")}
              </a>
            </label>
          </div>
          <div className="flex flex-col gap-4 mt-8">
            <SeznamLogin
              message={i18n.translate("continueSeznam")}
              consentGiven={consentGiven}
              onBlockedClick={() => setAttemptedClick(true)}
              className={
                (!consentGiven ? "opacity-50 cursor-not-allowed " : "") +
                "w-full py-3 px-6 rounded-xl text-lg font-bold shadow-md transition-all duration-150 hover:scale-105 hover:shadow-xl"
              }
            />
            <div className="flex flex-row gap-4 w-full">
              <GoogleLogin
                message={i18n.translate("continueGoogle")}
                consentGiven={consentGiven}
                onBlockedClick={() => setAttemptedClick(true)}
                className={
                  (!consentGiven ? "opacity-50 cursor-not-allowed " : "") +
                  "w-full py-3 rounded-xl text-lg font-bold shadow-md transition-all duration-150 hover:scale-105 hover:shadow-xl"
                }
              />
              <DiscordLogin
                message={i18n.translate("continueDiscord")}
                consentGiven={consentGiven}
                onBlockedClick={() => setAttemptedClick(true)}
                className={
                  (!consentGiven ? "opacity-50 cursor-not-allowed " : "") +
                  "w-full py-3 rounded-xl text-lg font-bold shadow-md transition-all duration-150 hover:scale-105 hover:shadow-xl"
                }
              />
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

export default Welcome;
