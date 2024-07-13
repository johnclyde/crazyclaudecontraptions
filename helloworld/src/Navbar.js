import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white hover:text-gray-300">
          Grind Olympiads
        </Link>
        <Link to="/labs" className="text-white text-xl font-bold">
          Component Directory
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
