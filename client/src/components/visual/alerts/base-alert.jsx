function BaseAlert({
  title,
  message,
  icon,
  color = "!text-red-400 !border-red-800",
  buttons = [],
  children,
}) {
  return (
    <div
      className={`relative p-4 mb-4 rounded-lg !bg-gray-800 ${color}`}
      role="alert"
    >
      <div className="flex items-center">
        {icon}
        <h3 className="text-lg font-medium ml-2">{title}</h3>
      </div>
      <div className="mt-2 mb-4 text-sm">{message}</div>
      <div className="flex flex-wrap gap-2">{buttons}</div>
      {children}
    </div>
  );
}

export default BaseAlert;
