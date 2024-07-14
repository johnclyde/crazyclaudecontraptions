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
    if (isScriptLoaded && window.google) {
      const allowedOrigins =
        process.env.NODE_ENV === "production"
          ? ["https://olympiads-ba812.web.app"]
          : ["http://localhost:3000"];

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_API_KEY,
        callback: handleCredentialResponse,
        allowed_origins: allowedOrigins,
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
