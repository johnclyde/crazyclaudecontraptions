import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock("./firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock("firebase/app", () => {
  const auth = {
    onAuthStateChanged: jest.fn(),
  };
  return {
    initializeApp: jest.fn(),
    auth: jest.fn(() => auth),
  };
});

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: jest.fn(),
}));

configure({ asyncUtilTimeout: 5000 });
