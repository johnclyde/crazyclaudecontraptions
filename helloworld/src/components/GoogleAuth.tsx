import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

interface GoogleAuthProps {
  onSuccess: (response: CredentialResponse) => void;
  onFailure: (error: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onFailure }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log("Client ID:", clientId);

  if (!clientId) {
    console.error("Google Client ID is not set");
    return null;
  }

  const handleError = () => {
    console.error("Google Sign-In Error.");
    onFailure(new Error("Google Sign-In failed"));
  };

  return (
    <GoogleOAuthProvider clientId={clientId} onScriptLoadError={handleError}>
      <GoogleLogin onSuccess={onSuccess} onError={handleError} useOneTap />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
