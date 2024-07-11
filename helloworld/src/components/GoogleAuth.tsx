import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAuthProps {
  clientId: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({
  clientId,
  onSuccess,
  onFailure,
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

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
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" },
      );
    }
  }, [isScriptLoaded, clientId]);

  const handleCredentialResponse = (response: any) => {
    if (response.credential) {
      onSuccess(response);
    } else {
      onFailure("Google Sign-In failed");
    }
  };

  return (
    <div>
      <div id="googleSignInButton"></div>
    </div>
  );
};

export default GoogleAuth;
