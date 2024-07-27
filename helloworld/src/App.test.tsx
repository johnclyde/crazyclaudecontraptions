import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./components/Header", () => {
  return function MockHeader() {
    return <div>GrindOlympiads</div>;
  };
});

jest.mock("./components/NotificationBell", () => {
  return function MockNotificationBell() {
    return <div>Notifications</div>;
  };
});

jest.mock("./components/UserMenu", () => {
  return function MockUserMenu() {
    return <div>User Menu</div>;
  };
});

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
