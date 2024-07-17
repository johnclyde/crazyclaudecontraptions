import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { mockAuth } from "./setupTests";

// Mock the UserDataContext
jest.mock("./contexts/UserDataContext", () => ({
  UserDataProvider: ({ children }) => children,
  useUserData: () => ({
    user: null,
    isLoggedIn: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

test("renders App without crashing", () => {
  mockAuth.onAuthStateChanged.mockImplementation((callback) => callback(null));

  render(
    <BrowserRouter>
      <GoogleOAuthProvider clientId="dummy-client-id">
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>,
  );
});

test("renders GrindOlympiads header", () => {
  render(<App />);
  const headerElement = screen.getByText(/GrindOlympiads/i);
  expect(headerElement).toBeInTheDocument();
});
