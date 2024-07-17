import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const mockResponses = {
  "https://us-central1-olympiads.cloudfunctions.net/exams": {
    tests: [
      { competition: "Math", year: "2023", exam: "Spring" },
      { competition: "Physics", year: "2023", exam: "Fall" },
    ],
  },
  "https://us-central1-olympiads.cloudfunctions.net/exam-data": {
    problems: [
      { number: 1, problem: "What is 2+2?", image_url: null },
      { number: 2, problem: "Solve for x: 2x + 3 = 7", image_url: null },
    ],
    comment: "Good luck!",
  },
  "https://us-central1-olympiads.cloudfunctions.net/notifications": [
    {
      id: "1",
      message: "New test available",
      timestamp: "2023-07-17T10:00:00Z",
      read: false,
    },
    {
      id: "2",
      message: "Your score is ready",
      timestamp: "2023-07-16T15:30:00Z",
      read: true,
    },
  ],
  "https://us-central1-olympiads.cloudfunctions.net/user-progress": [
    {
      id: "1",
      testId: "math2023spring",
      score: 80,
      completedAt: "2023-07-15T14:00:00Z",
    },
    {
      id: "2",
      testId: "physics2023fall",
      score: 75,
      completedAt: "2023-07-14T16:30:00Z",
    },
  ],
  "https://us-central1-olympiads.cloudfunctions.net/login": {
    user: { id: "user1", name: "Test User", email: "test@example.com" },
    token: "mock-token",
  },
};

global.fetch = jest.fn((url) => {
  if (url in mockResponses) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponses[url]),
    });
  }

  console.warn(`Unmocked fetch request to ${url}`);
  return Promise.reject(new Error(`Unmocked fetch request to ${url}`));
});

// Mock Firebase Auth
const mockAuth = {
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
};

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
});
