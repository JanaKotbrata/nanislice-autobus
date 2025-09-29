import TopRightControls from "./top-right-controls.jsx";
import { useAuth } from "../providers/auth-context-provider.jsx";
import PageHeader from "./page-header.jsx";
import PageFooter from "./page-footer.jsx";

/**
 * Universal page container for centered content with consistent background, border, shadow, and padding.
 */
function PageContainer({
  children,
  showVolume = true,
  showLang = true,
  header,
  footer,
  isCustomHeader = false,
}) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  return (
    <div className="flex justify-center items-start w-full flex-1">
      <div className="flex flex-col min-h-screen w-full bg-transparent">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-6xl px-0 pt-8 flex justify-end">
            <TopRightControls
              showVolume={showVolume}
              showLang={showLang}
              showLogOut={isLoggedIn}
              className="static bg-gray-950/70 rounded-xl px-4 py-2 shadow-lg border border-cyan-900/40"
            />
          </div>
        </div>
        <div className="flex justify-center items-center w-full flex-1">
          <div className="w-full max-w-6xl mt-8 rounded-3xl shadow-2xl bg-gray-950/40 border border-cyan-900/40 backdrop-blur-md px-0 pb-8 relative">
            {header && (
              <PageHeader isCustom={isCustomHeader}>{header}</PageHeader>
            )}
            {children}
            {footer && <PageFooter>{footer}</PageFooter>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageContainer;
