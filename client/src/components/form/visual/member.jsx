import React from "react";

function Member({ children, level, picture }) {
  return (
    <div className="flex justify-between items-center h-16 p-4 my-6  rounded-lg border border-gray-100 shadow-md flex-grow">
      <div className="flex items-center">
        <img className="rounded-full h-12 w-12" src={picture} alt="Logo" />
        <div className="ml-2">
          <div className="text-sm font-semibold text-gray-600">{children}</div>
          <div className="text-sm font-light text-gray-500">{level}</div>
        </div>
      </div>
    </div>
  );
}

export default Member;
