import React from "react";
import BusPattern from "../components/bus-pattern.jsx";
import { FaLinkedin } from "react-icons/fa";
import { getAvatar } from "../services/user-service.jsx";
function Profile({ user }) {
  const avatarUri = getAvatar(user.userId);
  return (
    <section className="bg-gray-900 text-white min-h-screen flex items-center justify-center overflow-hidden">
      <BusPattern />
      <div className="max-w-sm mx-auto bg-gray-800 text-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-700">
        <div className="flex items-center gap-4">
          <img
            src={avatarUri}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border border-gray-500"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
        </div>

        <div className="bg-gray-700 rounded-md p-4">
          <p className="text-gray-300 mb-1">Získané XP:</p>
          <div className="w-full bg-gray-600 h-3 rounded-full">
            <div
              className="bg-green-400 h-3 rounded-full"
              style={{ width: `${(user.xp / 1000) * 100}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{user.xp} XP</p>
        </div>
      </div>
    </section>
  );
}

export default Profile;
