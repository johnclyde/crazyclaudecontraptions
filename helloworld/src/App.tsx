import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import BanzukeSurfer from "./components/BanzukeSurfer";
import ColorPicker from "./components/ColorPicker";
import ComponentDirectory from "./ComponentDirectory";
import GrindOlympiadsIndex from "./GrindOlympiadsIndex";
import GrindOlympiadsLayout from "./GrindOlympiadsLayout";
import InteractiveCounter from "./components/InteractiveCounter";
import ExamComponent from "./components/ExamComponent";
import UserResponseComponent from "./components/UserResponseComponent";
import Users from "./components/Users";
import { UserDataProvider } from "./contexts/UserDataContext";

const LabsLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
  const isStaging = process.env.REACT_APP_ENVIRONMENT === "staging";

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <Router>
        <UserDataProvider>
          <Routes>
            <Route element={<GrindOlympiadsLayout isStaging={isStaging} />}>
              <Route index element={<GrindOlympiadsIndex />} />
              <Route
                path="competition/:competition/:year/:exam"
                element={<ExamComponent />}
              />
              <Route
                path="exam/:examId/respond"
                element={<UserResponseComponent />}
              />
              <Route path="labs/*" element={<LabsLayout />} />
            </Route>
          </Routes>
        </UserDataProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
