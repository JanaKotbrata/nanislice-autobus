import React, { useContext } from "react";
import nanislice from "../assets/nanislice.svg";
import DiscordLogin from "../components/visual/login/discord-login.jsx";
import GoogleLogin from "../components/visual/login/google-login.jsx";
import SeznamLogin from "../components/visual/login/seznam-login.jsx";
import LangSelector from "../components/visual/lang-selector.jsx";
import LanguageContext from "../context/language.js";
function Welcome() {
  const i18n = useContext(LanguageContext);
  return (
    <section className="!text-white min-h-screen flex items-center justify-center overflow-hidden">
      <div className="mx-auto max-w-sm md:max-w-md lg:max-w-lg relative z-10">
        <LangSelector size={32} />
        <div className="!bg-gray-950/90 !border-blackbg-gray-800  rounded-lg w-full">
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
            <a
              href="/about"
              className="flex items-center mb-6 text-lg sm:text-base md:text-xl font-semibold !text-gray-800  hover:!text-cyan-500"
            >
              <img className="w-8 h-8 mr-2" src={nanislice || ""} alt="logo" />
              nanislice-autobus
            </a>
            <h1 className="text-xl sm:text-lg md:text-2xl font-bold leading-tight tracking-tight text-white">
              {i18n.translate("signIn")}
            </h1>
            <form className="space-y-4 sm:space-y-5 md:space-y-6" action="#">
              <p className="text-sm sm:text-xs md:text-base text-gray-400">
                {i18n.translate("welcomeTitle")}
              </p>
              <hr className="h-px my-6 sm:my-4 md:my-8 bg-cyan-400/50 border-cyan-400/50 border-1" />
              <div className="flex items-center justify-center">
                <SeznamLogin message={i18n.translate("continueSeznam")} />
              </div>
              <div className="flex items-center justify-center gap-x-6">
                <GoogleLogin message={i18n.translate("continueGoogle")} />
                <DiscordLogin message={i18n.translate("continueDiscord")} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Welcome;
