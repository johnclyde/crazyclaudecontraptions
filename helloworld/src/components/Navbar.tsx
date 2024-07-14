import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();
  const isLabsPath = location.pathname.startsWith("/labs");

  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  return (
    <>
      <nav className="bg-black text-white p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Grind Olympiads
        </Link>
        <div className="flex items-center space-x-4">
          {isLabsPath && (
            <Link to="/" className="text-white hover:text-gray-300">
              Back to Grind Olympiads
            </Link>
          )}
          <button onClick={toggleNotification} className="text-xl">
            <i className="fas fa-bell"></i>
          </button>
          <button className="text-xl">
            <i className="fas fa-user"></i>
          </button>
        </div>
      </nav>
      {showNotification && (
        <div className="bg-blue-500 text-white p-2 text-center">
          You have no new notifications
        </div>
      )}
    </>
  );
};

export default Navbar;
