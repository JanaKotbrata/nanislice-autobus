import React, { createContext, useContext } from "react";
import { useAlerts } from "../../hooks/use-alerts.js";

const AlertContext = createContext();

export function AlertContextProvider({ children }) {
  const alert = useAlerts();
  return (
    <AlertContext.Provider value={alert}>{children}</AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
