import React, { useState } from 'react';
import GrindOlympiadsLayout from './GrindOlympiadsLayout';

const GrindOlympiadsIndex = () => {
  const [showTests, setShowTests] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Simulated tests data
  const tests = [
    'AMC 8 - 2023 - Fall',
    'AMC 10 - 2024 - Spring',
    'AMC 12 - 2023 - Winter',
    'AIME - 2024 - I',
    'USAMO - 2023 - Day 1',
  ];

  const toggleTests = () => {
    setShowTests(!showTests);
  };

  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  return (
    <GrindOlympiadsLayout>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <nav className="bg-black text-white p-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold">Home</a>
          <div className="flex items-center space-x-4">
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

        <header className="text-center py-10 bg-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to GrindOlympiads!</h1>
          <button
            onClick={toggleTests}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View Tests
          </button>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
          {showTests && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Available Tests</h2>
              {tests.length > 0 ? (
              <ul className="space-y-2">
                  {tests.map((test, index) => (
                    <li key={index}>
                      <a
                        href={`/competition/${test.replace(/ - /g, '/')}`}
                        className="text-blue-500 hover:underline"
                      >
                        {test}
                        </a>
                      </li>
                  ))}
                </ul>
              ) : (
                <p>No tests available at the moment. Please check back later.</p>
              )}
            </section>
          )}
        </main>
  
        <footer className="bg-gray-200 text-center p-4">
          <p>&copy; 2024 Grind Olympiads. All rights reserved.</p>
          <p className="text-sm text-gray-600">Build Version: 1.0.0</p>
        </footer>
      </div>
    </GrindOlympiadsLayout>
  );
};
  
export default GrindOlympiadsIndex;
