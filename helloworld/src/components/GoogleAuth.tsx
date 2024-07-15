import React from "react";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google";

interface GoogleAuthProps {
  onSuccess: (response: CredentialResponse) => void;
  onFailure: (error: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onFailure }) => {
  const login = useGoogleLogin({
    onSuccess: onSuccess,
    onError: onFailure,
    scope: "email profile",
  });

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
    >
      <img
        className="w-6 h-6"
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        loading="lazy"
        alt="google logo"
      />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleAuth;
