import { AuthProvider } from "./auth-context-provider.jsx";
import AudioContextProvider from "./audio-context-provider.jsx";
import LanguageProvider from "./language-context-provider.jsx";
import CardStyleContextProvider from "./card-style-context-provider.jsx";
import GameboardColorContextProvider from "./gameboard-color-context-provider.jsx";

function BasicProviderContainer({ children }) {
  return (
    <AuthProvider>
      <AudioContextProvider>
        <LanguageProvider>
          <CardStyleContextProvider>
            <GameboardColorContextProvider>
              {children}
            </GameboardColorContextProvider>
          </CardStyleContextProvider>
        </LanguageProvider>
      </AudioContextProvider>
    </AuthProvider>
  );
}

export default BasicProviderContainer;
