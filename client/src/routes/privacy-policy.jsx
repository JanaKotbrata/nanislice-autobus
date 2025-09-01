import React from "react";
import { FaLinkedin } from "react-icons/fa";
import LogOut from "../components/visual/login/log-out.jsx";
import LangSelector from "../components/visual/lang-selector.jsx";
import LanguageContext from "../context/language.js";
import VolumeSettings from "../components/visual/volume-settings.jsx";

function PrivacyPolicy() {
  const i18n = React.useContext(LanguageContext);
  return (
    <section className="text-white min-h-screen flex flex-col items-center justify-start overflow-y-auto py-10">
      <div className="mx-auto max-w-3xl relative z-10 w-full px-4">
        <div className="flex flex-row gap-6 justify-end">
          <div className="p-2">
            <VolumeSettings size={22} />
          </div>
          <div className="p-2">
            <LangSelector size={32} />
          </div>
        </div>

        <div className="relative w-full p-6 sm:p-8 md:p-10 rounded-2xl bg-gray-950/90 backdrop-blur-md shadow-[0_0_40px_rgba(3,7,18,0.9)] hover:shadow-[0_0_50px_rgba(31,41,55,0.5)] transition-all duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            {i18n.translate("privacyPolicy.title")}
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 mb-4">
            {i18n.translate("privacyPolicy.intro")}
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("privacyPolicy.whatWeCollect.title")}
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {i18n.translate("privacyPolicy.whatWeCollect.content")}
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
            <li>{i18n.translate("privacyPolicy.name")}</li>
            <li>{i18n.translate("privacyPolicy.avatar")}</li>
            <li>{i18n.translate("privacyPolicy.email")}</li>
          </ul>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("privacyPolicy.purpose.title")}
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {i18n.translate("privacyPolicy.purpose.content")}
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("privacyPolicy.sharing.title")}
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {i18n.translate("privacyPolicy.sharing.content")}
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("privacyPolicy.retention.title")}
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {i18n.translate("privacyPolicy.retention.content")}
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("privacyPolicy.rights.title")}
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {i18n.translate("privacyPolicy.rights.content")}
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("privacyPolicy.contact.title")}
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {i18n.translate("privacyPolicy.contact.content")}
          </p>

          <hr className="h-px my-6 bg-cyan-400/50 border-cyan-400/50" />

          <div className="mt-6 flex items-center justify-center gap-2 text-center text-gray-400 text-sm">
            <p>{i18n.translate("aboutFooter")}</p>
            <a
              href="https://www.linkedin.com/in/jana-kotrbat%C3%A1-b51329141/"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-blue-500 hover:!text-cyan-400"
            >
              <FaLinkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrivacyPolicy;
