import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { server } from './mocks/server';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.fetch = jest.fn();

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => children,
}));
