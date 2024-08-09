import React, { useState } from 'react';
import { useUserDataContext } from '../contexts/UserDataContext';

const Settings: React.FC = () => {
  const { user, logout } = useUserDataContext();
  const [email, setEmail] = useState(user?.email || '');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saveAlert, setSaveAlert] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving settings:', { email, darkMode, notifications });
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  return (
    <div className="w-[400px] mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkModeToggle}
              className="mr-2"
            />
            Dark Mode
          </label>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleNotificationsToggle}
              className="mr-2"
            />
            Enable Notifications
          </label>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded">
          Save Settings
        </button>
      </form>
      <button onClick={logout} className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
      {saveAlert && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default Settings;
