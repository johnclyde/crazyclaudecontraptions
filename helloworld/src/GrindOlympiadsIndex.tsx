import React, { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TestSearch from "./components/TestSearch";
import TestList from "./components/TestList";
import UserProgress from "./components/UserProgress";
import useNotifications from "./hooks/useNotifications";
import useUserData from "./hooks/useUserData";
import useTests from "./hooks/useTests";

const GrindOlympiadsIndex: React.FC = () => {
  const [showTests, setShowTests] = useState<boolean>(false);
  const { user, isLoggedIn, login, logout, userProgress } = useUserData();
  const { notifications, notificationsError, markNotificationAsRead } =
    useNotifications();
  const {
    tests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCompetition,
    setSelectedCompetition,
    filteredTests,
  } = useTests();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen bg-gray-100">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Header
          user={user}
          isLoggedIn={isLoggedIn}
          notifications={notifications}
          notificationsError={notificationsError}
          markNotificationAsRead={markNotificationAsRead}
          login={login}
          logout={logout}
        />
        <Hero showTests={showTests} setShowTests={setShowTests} />
        {showTests && (
          <>
            <TestSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCompetition={selectedCompetition}
              setSelectedCompetition={setSelectedCompetition}
              tests={tests}
            />
            <TestList tests={filteredTests} />
          </>
        )}
        {isLoggedIn && <UserProgress userProgress={userProgress} />}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GrindOlympiadsIndex;
