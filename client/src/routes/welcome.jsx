import React from "react";
import nanislice from "../assets/nanislice.svg";
import google from "../assets/google.svg";
import Button from "../components/form/visual/button.jsx";
import DiscordLogin from "./welcome/discord-login.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Welcome() {
  function handleGoogleLogin(e) {
    e.preventDefault();
    const redirectUrl = encodeURIComponent(
      "http://localhost:5173/auth-callback",
    );
    window.location.href = `http://localhost:1234/auth/google?redirect_uri=${redirectUrl}`;
  }

  function callApi() {
    return axios.get("/api/game/list").then((response) => {
      console.log(response.data);
    });
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto max-w-sm w-full md:h-auto lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-xl font-semibold text-gray-900 dark:text-white"
        >
          <img className="w-8 h-8 mr-2 logo react" src={nanislice} alt="logo" />
          nanislice-autobus
        </a>
        <div className="dark:bg-gray-800 dark:border-gray-700 rounded-lg w-full">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <p className="text-gray-500 dark:text-gray-400">
                blablabliblubus.
              </p>
              <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

              <div className="flex items-center">
                <Button onClick={handleGoogleLogin}>
                  <img className="mr-2" src={google} alt="logo" />
                  <span>Continue with Google</span>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <DiscordLogin />
              </div>
              <div className="flex items-center">
                <Button onClick={() => callApi()}>
                  <span>Continue with Google</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Welcome;
