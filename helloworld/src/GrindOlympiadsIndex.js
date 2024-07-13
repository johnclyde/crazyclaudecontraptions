import React, { useState } from 'react';

const GrindOlympiadsIndex = () => {
  const [showTests, setShowTests] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock user data
  const user = {
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=68'
  };

  // Mock test data
  const tests = [
    { competition: 'AMC', year: '2012', exam: 'AMC-10A' },
    { competition: 'AMC', year: '2012', exam: 'AMC-10B' },
    { competition: 'AMC', year: '2013', exam: 'AMC-10A' },
    { competition: 'ARML', year: '2023', exam: 'Team Round' },
    { competition: 'ARML', year: '2024', exam: 'Team Round' },
    { competition: 'Davilmpiads', year: '2024', exam: 'Davilmpiads' },
    { competition: 'Washington Math Olympiad', year: '2024', exam: 'Proofs' },
    { competition: 'moSp', year: '2024', exam: 'Mock IMO Day 1' },
    { competition: 'moSp', year: '2024', exam: 'Mock IMO Day 2' },
  ];

  // Mock notifications
  const notifications = [
    { id: 1, message: 'New AMC 10A test available!', read: false },
    { id: 2, message: 'You completed ARML Team Round. Great job!', read: true },
    { id: 3, message: 'Upcoming contest: Washington Math Olympiad', read: false },
  ];

  // Mock user progress
  const userProgress = [
    { competition: 'AMC', year: '2012', exam: 'AMC-10A', score: 120 },
    { competition: 'ARML', year: '2023', exam: 'Team Round', score: 45 },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  const filteredTests = tests.filter(test => 
    (selectedCompetition === 'All' || test.competition === selectedCompetition) &&
    (test.competition.toLowerCase().includes(searchTerm.toLowerCase()) ||
     test.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
     test.year.includes(searchTerm))
  );

  const competitions = ['All', ...new Set(tests.map(test => test.competition))];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">GrindOlympiads</div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`px-4 py-2 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700 font-semibold'}`}>
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-full"
              >
                {isLoggedIn ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  {isLoggedIn ? (
                    <>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                    </>
                  ) : (
                    <button onClick={handleLogin} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to GrindOlympiads!</h1>
          <button 
            onClick={() => setShowTests(!showTests)}
            className="bg-white text-blue-500 font-bold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300"
          >
            {showTests ? 'Hide Tests' : 'View Tests'}
          </button>
        </div>
      </div>

      {showTests && (
        <div className="container mx-auto py-8">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
            <input
              type="text"
              placeholder="Search tests..."
              className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="mt-4 md:mt-0 w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
            >
              {competitions.map(competition => (
                <option key={competition} value={competition}>{competition}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-2">{test.competition}</h3>
                <p className="text-gray-600 mb-4">{`${test.year} - ${test.exam}`}</p>
                <a 
                  href={`/competition/${test.competition}/${test.year}/${test.exam}`}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                  Take Test
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="container mx-auto py-8">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Completed Tests</h3>
            <ul>
              {userProgress.map((progress, index) => (
                <li key={index} className="mb-2">
                  {`${progress.competition} ${progress.year} ${progress.exam}: Score ${progress.score}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrindOlympiadsIndex;
