import React from "react";
import nanislice from "../assets/nanislice.svg";
import DiscordLogin from "./welcome/discord-login.jsx";
import GoogleLogin from "./welcome/google-login.jsx";
import SeznamLogin from "./welcome/seznam-login.jsx";
import BusPattern from "../components/bus-pattern.jsx";
function Welcome() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <BusPattern />
      <div className="mx-auto max-w-sm md:max-w-md lg:max-w-lg relative z-10">
        <div className="dark:bg-gray-800 dark:border-gray-700 rounded-lg w-full">
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
            <a
              href="#"
              className="flex items-center mb-6 text-lg sm:text-base md:text-xl font-semibold text-gray-900 dark:text-white"
            >
              <img className="w-8 h-8 mr-2" src={nanislice || ""} alt="logo" />
              nanislice-autobus
            </a>
            <h1 className="text-xl sm:text-lg md:text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              Přihlaš se
            </h1>
            <form className="space-y-4 sm:space-y-5 md:space-y-6" action="#">
              <p className="text-sm sm:text-xs md:text-base text-gray-500 dark:text-gray-400">
                Vzniklo pro procvičení kódění, z lásky ke kartám a vzpomínkám na
                babi.
              </p>
              <hr className="h-px my-6 sm:my-4 md:my-8 bg-gray-200 border-0 dark:bg-gray-700" />
              <div className="flex items-center justify-center">
                <SeznamLogin />
              </div>
              <div className="flex items-center justify-center gap-x-6">
                <GoogleLogin />
                <DiscordLogin />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Welcome;
