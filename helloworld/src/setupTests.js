import "@testing-library/jest-dom";
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from "util";
import { useEffect } from 'react';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

// New additions

// Mock useEffect
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

// Configure testing library
configure({ asyncUtilTimeout: 5000 });
