import React from "react";
import { FaLinkedin } from "react-icons/fa";
import LanguageContext from "../context/language.js";
import PageContainer from "../components/visual/page-container.jsx";

function PrivacyPolicy() {
  const i18n = React.useContext(LanguageContext);

  const header = (
    <div className="flex items-center justify-center px-10 pt-8 pb-6 border-b border-cyan-700/30 bg-gray-950/60 rounded-t-3xl shadow-md">
      <span className="text-3xl font-bold tracking-wide text-white drop-shadow text-center w-full">
        {i18n.translate("privacyPolicy.title")}
      </span>
    </div>
  );

  const footer = (
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
  );

  return (
    <PageContainer header={header} footer={footer}>
      <div className="w-full gap-6 px-10 pt-8 ">
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
      </div>
    </PageContainer>
  );
}

export default PrivacyPolicy;
