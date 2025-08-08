import React, { useContext } from "react";
import LanguageContext from "../../../context/language.js";

function AlertRules({ onClose }) {
  const i18n = useContext(LanguageContext);

  return (
    <div className="fixed inset-0 z-50 !bg-black/60 flex items-center justify-center px-4 py-8">
      <div className="!bg-gray-700 !text-gray-100 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4 text-sm">
        <h3 className="font-semibold mb-2">
          {i18n.translate("dangerAlertHints")}
        </h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>{i18n.translate("dangerAlertFirstHint")}</li>
          <li>{i18n.translate("dangerAlertSecondHint")}</li>
          <li>{i18n.translate("dangerAlertThirdHint")}</li>
        </ol>

        <h3 className="font-semibold my-2">
          {i18n.translate("dangerAlertRules")}
        </h3>
        <h4 className="mb-2">{i18n.translate("dangerAlertGoalOfTheGame")}</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>{i18n.translate("dangerAlertFirstRule")}</li>
          <li>{i18n.translate("dangerAlertSecondRule")}</li>
          <li>{i18n.translate("dangerAlertThirdRule")}</li>
          <li>{i18n.translate("dangerAlertFourthRule")}</li>
          <li>{i18n.translate("dangerAlertFifthRule")}</li>
        </ol>

        <button
          onClick={onClose}
          className="mt-4 text-xs px-3 py-1.5 rounded !bg-red-600 !hover:bg-red-700 !text-white"
        >
          {i18n.translate("dangerAlertCloseRules")}
        </button>
      </div>
    </div>
  );
}

export default AlertRules;
