import React, { useState, useEffect, useRef } from 'react';

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

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

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

        // Fetch user progress
        const progressResponse = await fetch('https://us-central1-olympiads.cloudfunctions.net/user_progress');
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch user progress');
        }
        const progressData = await progressResponse.json();
        setUserProgress(progressData);

        // Fetch notifications
        const notificationsResponse = await fetch('https://us-central1-olympiads.cloudfunctions.net/notifications');
        if (!notificationsResponse.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Add click event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  };

  const handleProfileClick = () => {
    // Add logic for profile navigation or action
    console.log('Navigate to profile');
  };

  const handleSettingsClick = () => {
    // Add logic for settings navigation or action
    console.log('Navigate to settings');
  };

  const handleLogin = () => {
    // Mock login for demonstration
    setUser({ name: 'John Doe', avatar: 'https://example.com/avatar.jpg' });
    setIsLoggedIn(true);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch('https://us-central1-olympiads.cloudfunctions.net/mark_notification_read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update the local state to reflect the change
      setNotifications(notifications.map(n =>
        n.id === notificationId ? {...n, read: true} : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredTests = tests.filter(test =>
    (selectedCompetition === 'All' || test.competition === selectedCompetition) &&
    (test.competition.toLowerCase().includes(searchTerm.toLowerCase()) ||
     test.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
     test.year.includes(searchTerm))
  );

  const competitions = ['All', ...new Set(tests.map(test => test.competition))];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">GrindOlympiads</div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
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
                    <div
                      key={notification.id}
                      className={`px-4 py-2 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700 font-semibold'}`}
                      onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                    >
                      {notification.message}
                      <div className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={userMenuRef}>
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

      {/* Main content */}
      <main className="container mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Welcome to GrindOlympiads</h1>

        {/* Search and filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tests..."
            className="p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="ml-4 p-2 border rounded"
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
          >
            {competitions.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
        </div>

        {/* Tests grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <div key={`${test.competition}-${test.year}-${test.exam}`} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{test.competition}</h2>
              <p className="text-gray-600 mb-2">{test.year} - {test.exam}</p>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Start Test
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GrindOlympiadsIndex;
