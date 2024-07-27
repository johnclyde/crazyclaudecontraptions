import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
    currentUser: null,
  },
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

test("renders GrindOlympiads header", () => {
  render(<App />);
  const headerElement = screen.getByText(/GrindOlympiads/i);
  expect(headerElement).toBeInTheDocument();
  expect(console.error).toHaveBeenCalledTimes(3);
  expect(console.error).toHaveBeenCalledWith(
    "Firebase auth is not initialized correctly",
  );
});
