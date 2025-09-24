import { AuthProvider } from "./auth-context-provider.jsx";
import AudioContextProvider from "./audio-context-provider.jsx";
import LanguageProvider from "./language-context-provider.jsx";
import CardStyleContextProvider from "./card-style-context-provider.jsx";

const BasicProviderContainer = ({ children }) => (
  <AuthProvider>
    <AudioContextProvider>
      <LanguageProvider>
        <CardStyleContextProvider>{children}</CardStyleContextProvider>
      </LanguageProvider>
    </AudioContextProvider>
  </AuthProvider>
);

export default BasicProviderContainer;
