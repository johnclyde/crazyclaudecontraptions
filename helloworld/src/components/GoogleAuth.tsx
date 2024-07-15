import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface GoogleAuthProps {
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onFailure }) => {
  console.log("Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const handleError = () => {
    onFailure(new Error("Google Sign-In failed"));
  };

  return (
    <GoogleOAuthProvider clientId={process.env.READ_APP_GOOGLE_CLIENT_ID!}>
      <GoogleLogin onSuccess={onSuccess} onError={handleError} />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
