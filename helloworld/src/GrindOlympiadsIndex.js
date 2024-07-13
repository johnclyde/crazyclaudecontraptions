import React, { useState, useEffect } from 'react';

const GrindOlympiadsIndex = () => {
  const [showTests, setShowTests] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user data
        const userResponse = await fetch('https://us-central1-olympiads.cloudfunctions.net/user');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUser(userData);
        setIsLoggedIn(true);

        // Fetch tests
        const testsResponse = await fetch('https://us-central1-olympiads.cloudfunctions.net/exams');
        if (!testsResponse.ok) {
          throw new Error('Failed to fetch tests');
        }
        const testsData = await testsResponse.json();
        setTests(testsData.tests || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    // Fetch notifications
    fetch('/api/notifications')
      .then(response => response.json())
      .then(data => setNotifications(data))
      .catch(error => console.error('Error fetching notifications:', error));

    // Fetch user progress
    fetch('/api/user-progress')
      .then(response => response.json())
      .then(data => setUserProgress(data))
      .catch(error => console.error('Error fetching user progress:', error));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileClick = () => {
    // Add logic for profile navigation or action
    console.log('Navigate to profile');
  };

  const handleSettingsClick = () => {
    // Add logic for settings navigation or action
    console.log('Navigate to settings');
  };

  const handleLogin = () => {
    // Implement actual login logic here
    fetch('/api/login', {
      method: 'POST',
      // Add necessary headers and body
    })
      .then(response => response.json())
      .then(data => {
        setUser(data);
        setIsLoggedIn(true);
      })
      .catch(error => console.error('Error logging in:', error));
  };

  const handleLogout = () => {
    // Implement actual logout logic here
    fetch('/api/logout', {
      method: 'POST',
      // Add necessary headers
    })
      .then(() => {
        setUser(null);
        setIsLoggedIn(false);
        setShowUserMenu(false);
      })
      .catch(error => console.error('Error logging out:', error));
  };

  const filteredTests = tests ? tests.filter(test =>
    (selectedCompetition === 'All' || test.competition === selectedCompetition) &&
    (test.competition.toLowerCase().includes(searchTerm.toLowerCase()) ||
     test.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
     test.year.includes(searchTerm))
  ) : [];

  const competitions = ['All', ...new Set(tests ? tests.map(test => test.competition) : [])];

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
                {isLoggedIn && user ? (
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
                      <button onClick={handleProfileClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                      <button onClick={handleSettingsClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
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
