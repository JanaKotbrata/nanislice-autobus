import React, { useEffect, useState } from "react";
import BusPattern from "../components/bus-pattern.jsx";
import { getAvatar } from "../services/user-service.jsx";
import UserContext from "../context/user.js";
import { FaPencilAlt } from "react-icons/fa";

function Profile() {
  const userContext = React.useContext(UserContext);
  const [name, setName] = useState(userContext?.user?.name || "Nemo");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatar = getAvatar(userContext.user.id, userContext.user.sys.rev);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (name && name !== userContext.user.name) {
        const formData = new FormData();
        formData.append("name", name);

        setIsSubmitting(true);
        userContext
          .update(formData)
          .then(() => {
            console.log("uložené jméno:", name);
          })
          .finally(() => setIsSubmitting(false));
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [name]);

  useEffect(() => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("picture", selectedFile);

    setIsSubmitting(true);
    userContext
      .update(formData)
      .then(() => {
        setSelectedFile(null);
        console.log("uložený picture");
      })
      .finally(() => setIsSubmitting(false));
  }, [selectedFile]);

  const handleNameChange = (e) => setName(e.target.value);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const level = userContext.user.level ?? 1;
  const xp = userContext.user.xp ?? 0;
  const xpPercent = Math.min((xp / 1000) * 100, 100);
  const email = userContext.user.email || "";
  const role = userContext.user.role || "pleb";

  return (
    <section className="relative bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <BusPattern />

      <div className="relative z-10 w-full max-w-2xl bg-gray-950/90 border border-black rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 text-white">
        <label className="cursor-pointer relative group">
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-600 shadow-md"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition">
            <FaPencilAlt className="mr-2 w-4 h-4" /> Změnit
          </div>
          <div className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-lg text-xs text-white">
            <FaPencilAlt className="w-3 h-3" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>

        <div className="text-center space-y-1 w-full relative">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="text-2xl font-bold text-center bg-transparent border-b border-gray-600 focus:outline-none focus:border-white w-full"
            />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              <FaPencilAlt className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm text-gray-400">{email}</p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <div className="w-24 text-right">
              <span>Role:</span>
            </div>
            <div className="font-semibold text-white w-24 text-left">
              <span>{role}</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <div className="w-24 text-right">
              <span>Levlík:</span>
            </div>
            <div className="font-semibold text-white w-24 text-left">
              <span>{level}</span>
            </div>
          </div>
        </div>

        <div className="w-full text-left">
          <p className="text-sm text-gray-300 mb-1">Získané XP</p>
          <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden relative">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 text-sm"
              style={{ left: `calc(${xpPercent}% - 10px)` }}
            >
              🚌
            </span>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">{xp} XP</p>
        </div>

        {isSubmitting && <p className="text-sm text-gray-500">Ukládám...</p>}
      </div>
    </section>
  );
}

export default Profile;
