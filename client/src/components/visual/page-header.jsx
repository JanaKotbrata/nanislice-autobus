/**
 * PageHeader component for consistent page section headers.
 * @param {React.ReactNode} children - Content to display inside the header.
 * @param {string} [className] - Additional classes for the wrapper.
 * @param isCustom
 */

function PageHeader({ children, className = "", isCustom = false }) {
  return isCustom ? (
    children
  ) : (
    <div
      className={`flex items-center justify-center px-10 pt-8 pb-6 border-b !border-cyan-700/30 !bg-gray-950/60 rounded-t-3xl shadow-md ${className}`}
    >
      <span className="text-3xl font-bold tracking-wide !text-white drop-shadow text-center w-full">
        {children}
      </span>
    </div>
  );
}

export default PageHeader;
