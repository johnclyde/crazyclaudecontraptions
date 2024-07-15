import React, { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAuthProps {
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onFailure }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleCredentialResponse = useCallback(
    (response: any) => {
      if (response.credential) {
        onSuccess(response);
      } else {
        onFailure("Google Sign-In failed");
      }
    },
    [onSuccess, onFailure],
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    console.log("Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
    if (isScriptLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" },
      );
    }
  }, [isScriptLoaded, handleCredentialResponse]);

  return (
    <div>
      <div id="googleSignInButton"></div>
    </div>
  );
};

export default GoogleAuth;
