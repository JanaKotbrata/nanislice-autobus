import LanguageContext from "../context/language.js";
import PageContainer from "../components/visual/page-container.jsx";
import { useContext } from "react";

function TechnologiesList({ i18n }) {
  const techKeys = [
    "technologyReact",
    "technologyTailwind",
    "technologySocketio",
    "technologyExpress",
    "technologyMongoDB",
    "technologyPassport",
    "technologyAxios",
    "technologyJest",
  ];
  return (
    <ul className="list-disc list-inside text-gray-300 space-y-2">
      {techKeys.map((key) => (
        <li key={key}>{i18n.translate(key)}</li>
      ))}
    </ul>
  );
}

function About() {
  const i18n = useContext(LanguageContext);

  return (
    <PageContainer
      header={i18n.translate("aboutTitle")}
      footer={i18n.translate("aboutFooter")}
    >
      <div className="w-full gap-6 px-10 pt-8 ">
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
        <TechnologiesList i18n={i18n} />
        <hr className="h-px my-6 bg-cyan-400/50 border-cyan-400/50" />
      </div>
    </PageContainer>
  );
}

export default About;
