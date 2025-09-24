/**
 * Badge component for displaying a colored label with content.
 * @param {React.ReactNode} children - Content to display inside the badge.
 * @param {string} colorClass - Tailwind class for the badge color (e.g. 'bg-yellow-400').
 * @param {string} [label] - Optional label before children.
 * @param {string} [className] - Additional classes for the wrapper.
 */
const UserBadge = ({ children, colorClass, label, className = "" }) => (
  <span className={`flex items-center gap-1 ${className}`}>
    <span className={`flex h-2 w-2 rounded-full ${colorClass}`} />
    {label && <span>{label}</span>}
    {children}
  </span>
);

export default UserBadge;
