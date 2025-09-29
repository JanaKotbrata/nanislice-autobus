import LanguageContext from "../context/language.js";
import PageContainer from "../components/visual/page-container.jsx";
import { useContext } from "react";

function PrivacyPolicy() {
  const i18n = useContext(LanguageContext);

  return (
    <PageContainer
      header={i18n.translate("privacyPolicy.title")}
      footer={i18n.translate("aboutFooter")}
    >
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
