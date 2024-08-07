import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GrindOlympiadsIndex from "./GrindOlympiadsIndex";
import GrindOlympiadsLayout from "./GrindOlympiadsLayout";
import ExamComponent from "./components/ExamComponent";
import UserResponseComponent from "./components/UserResponseComponent";
import Users from "./components/Users";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserDataProvider } from "./contexts/UserDataContext";
import LabsRoutes from "./LabsRoutes";
import Header from "./components/Header";
import NotificationBell from "./components/NotificationBell";
import UserMenu from "./components/UserMenu";

const App: React.FC = () => {
  const isStaging = process.env.REACT_APP_ENVIRONMENT === "staging";

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <Router>
        <UserDataProvider>
          <Routes>
            <Route
              element={
                <GrindOlympiadsLayout
                  isStaging={isStaging}
                  Header={Header}
                  NotificationBell={NotificationBell}
                  UserMenu={UserMenu}
                />
              }
            >
              <Route index element={<GrindOlympiadsIndex />} />
              <Route
                path="competition/:competition/:year/:exam"
                element={<ExamComponent />}
              />
              <Route
                path="exam/:examId/respond"
                element={<UserResponseComponent />}
              />
              <Route path="profile" element={<UserProfile />} />
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="admin/users" element={<Users />} />
              </Route>
              <Route path="labs/*" element={<LabsRoutes />} />
            </Route>
          </Routes>
        </UserDataProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
