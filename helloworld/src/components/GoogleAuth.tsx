import React, { useEffect, useState, useCallback } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface GoogleAuthProps {
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onFailure }) => {
  console.log("Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={clientId!}>
      <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
