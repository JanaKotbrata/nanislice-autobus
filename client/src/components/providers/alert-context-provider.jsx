import { useContext } from "react";
import { useAlerts } from "../../hooks/use-alerts.js";
import AlertContext from "../../context/alert.js";

export function AlertContextProvider({ children }) {
  const alert = useAlerts();

  return (
    <AlertContext.Provider value={alert}>{children}</AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
