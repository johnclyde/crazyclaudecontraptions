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
import ProtectedRoute from "./components/ProtectedRoute";
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
  const stagingLogin =
    process.env.NODE_ENV !== "production"
      ? () => {
          // Implement your staging login logic here
          console.log("Staging login as math1434@example.com");
          // You might want to call your login function here with the dummy user data
          // For example: login({ id: 'math1434', email: 'math1434@example.com', name: 'Math User', avatar: '', isAdmin: false });
        }
      : undefined;

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <Router>
        <UserDataProvider>
          <Routes>
            <Route
              element={<GrindOlympiadsLayout stagingLogin={stagingLogin} />}
            >
              <Route index element={<GrindOlympiadsIndex />} />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="competition/:competition/:year/:exam"
                  element={<ExamComponent />}
                />
                <Route
                  path="exam/:examId/respond"
                  element={<UserResponseComponent />}
                />
                <Route path="users" element={<Users isAdminMode={false} />} />
              </Route>
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route
                  path="admin/users"
                  element={<Users isAdminMode={true} />}
                />
              </Route>
              <Route path="labs/*" element={<LabsLayout />} />
            </Route>
          </Routes>
        </UserDataProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
