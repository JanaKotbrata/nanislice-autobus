import React from "react";

function Member({ children, level }) {
  return (
    <div className="flex justify-between items-center h-16 p-4 my-6  rounded-lg border border-gray-100 shadow-md">
      <div className="flex items-center">
        <img
          className="rounded-full h-12 w-12"
          src="https://static-cdn.jtvnw.net/jtv_user_pictures/27fdad08-a2c2-4e0b-8983-448c39519643-profile_image-70x70.png"
          alt="Logo"
        />
        <div className="ml-2">
          <div className="text-sm font-semibold text-gray-600">{children}</div>
          <div className="text-sm font-light text-gray-500">{level}</div>
        </div>
      </div>
    </div>
  );
}

export default Member;
