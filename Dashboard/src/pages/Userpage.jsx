import React from "react";

const Userpage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="bg-gray-800 text-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 text-center max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">🚀 Coming Soon</h1>
        <p className="text-gray-300 text-sm sm:text-base md:text-lg">
          We're building something exciting! Stay tuned for updates.
        </p>
      </div>
    </div>
  );
};

export {Userpage};
