import React from 'react';
import GrindOlympiadsNavbar from './GrindOlympiadsNavbar';

const GrindOlympiadsLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <GrindOlympiadsNavbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default GrindOlympiadsLayout;
