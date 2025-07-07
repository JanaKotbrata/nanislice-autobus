function ProfileButton() {
  return (
    <div
      onClick={() => navigate("/profile", "_blank")}
      className="flex justify-end mb-2 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-2 truncate">
        <img
          src={avatarUri}
          alt={myself.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-400"
        />
        <span className="truncate text-sm text-white">{myself.name}</span>
      </div>
    </div>
  );
}
export default ProfileButton;
