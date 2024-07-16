import React, { useState } from "react";
import Hero from "./components/Hero";
import TestSearch from "./components/TestSearch";
import TestList from "./components/TestList";
import UserProgress from "./components/UserProgress";
import useUserData from "./hooks/useUserData";
import useTests from "./hooks/useTests";

const GrindOlympiadsIndex: React.FC = () => {
  const [showTests, setShowTests] = useState<boolean>(false);
  const { user, isLoggedIn, login, logout } = useUserData();
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
  );
};

export default GrindOlympiadsIndex;
