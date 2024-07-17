import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));
