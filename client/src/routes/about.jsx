import React from "react";
import BusPattern from "../components/bus-pattern.jsx";
import { FaLinkedin } from "react-icons/fa";
import LogOut from "./user/log-out.jsx";
import LangSelector from "../components/form/visual/lang-selector.jsx";
import LanguageContext from "../context/language.js";

function About() {
  const i18n = React.useContext(LanguageContext);
  return (
    <section className="bg-gray-900 text-white min-h-screen flex items-center justify-center overflow-hidden">
      <BusPattern />
      <div className="mx-auto max-w-3xl relative z-10">
        <div className="flex flex-row gap-6 justify-end">
          <div className="p-2">
            <LangSelector size={32} />
          </div>
          <LogOut />
        </div>
        <div className="relative w-full p-6 sm:p-8 md:p-10 rounded-2xl bg-gray-950/90 backdrop-blur-md shadow-[0_0_40px_rgba(3,7,18,0.9)] hover:shadow-[0_0_50px_rgba(31,41,55,0.5)] transition-all duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            {i18n.translate("aboutTitle")}
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-4">
            {i18n.translate("aboutFirstParagraph")}
          </p>
          <p className="text-lg sm:text-xl text-gray-400 mb-4">
            {i18n.translate("aboutSecondParagraph")}
          </p>
          <hr className="h-px my-6 bg-cyan-400/50 border-cyan-400/50" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            {i18n.translate("aboutSecondTitle")}
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>{i18n.translate("firstTechnology")}</li>
            <li>{i18n.translate("secondTechnology")}</li>
            <li>{i18n.translate("thirdTechnology")}</li>
            <li>{i18n.translate("fourthTechnology")}</li>
            <li>{i18n.translate("fifthTechnology")}</li>
            <li>{i18n.translate("sixthTechnology")}</li>
            <li>{i18n.translate("seventhTechnology")}</li>
            <li>{i18n.translate("eighthTechnology")}</li>
          </ul>
          <hr className="h-px my-6 bg-cyan-400/50 border-cyan-400/50" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-center text-gray-400 text-sm">
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

export default About;
