import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Moon, Bell } from 'lucide-react';
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

  const handleLogout = () => {
    logout();
    // Any additional logout logic
  };

  return (
    <Card className="w-[400px] mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Settings</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex">
                <Mail className="w-4 h-4 mr-2 mt-3" />
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="flex-grow"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4" />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-6">
            Save Settings
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </CardFooter>
      {saveAlert && (
        <Alert className="mt-4">
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default Settings;
