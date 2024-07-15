import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import BanzukeSurfer from "./components/BanzukeSurfer";
import ColorPicker from "./components/ColorPicker";
import ComponentDirectory from "./ComponentDirectory";
import GrindOlympiadsIndex from "./GrindOlympiadsIndex";
import InteractiveCounter from "./components/InteractiveCounter";
import Header from "./components/Header";
import ExamComponent from "./components/ExamComponent";
import useUserData from "./hooks/useUserData";
import useNotifications from "./hooks/useNotifications";

const LabsLayout: React.FC = () => {
  const { user, isLoggedIn, login, logout } = useUserData();
  const { notifications, notificationsError, markNotificationAsRead } =
    useNotifications();

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        notifications={notifications}
        notificationsError={notificationsError}
        markNotificationAsRead={markNotificationAsRead}
        login={login}
        logout={logout}
      />
      <main className="flex-grow">
        <Routes>
          <Route index element={<ComponentDirectory />} />
          <Route path="banzuke-surfer" element={<BanzukeSurfer />} />
          <Route path="interactive-counter" element={<InteractiveCounter />} />
          <Route path="color-picker" element={<ColorPicker />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <Router>
        <Routes>
          <Route path="/" element={<GrindOlympiadsIndex />} />
          <Route
            path="/competition/:competition/:year/:exam"
            element={<ExamComponent />}
          />
          <Route path="/labs/*" element={<LabsLayout />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
