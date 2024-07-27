import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { UserDataProvider } from "./contexts/UserDataContext";

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

// Mock the useUserData hook
jest.mock("./hooks/useUserData", () => ({
  __esModule: true,
  default: () => ({
    user: { id: "user1", isAdmin: true },
    isLoggedIn: true,
    isAdminMode: false,
    toggleAdminMode: jest.fn(),
    // ... other necessary properties
  }),
}));

// Mock the Header component
jest.mock("./components/Header", () => {
  return function MockHeader({ toggleAdminMode }) {
    return (
      <div>
        <span>Header</span>
        <button onClick={toggleAdminMode}>Toggle Admin Mode</button>
      </div>
    );
  };
});

// Mock the Users component
jest.mock("./components/Users", () => {
  return function MockUsers() {
    return <div>Users Component</div>;
  };
});

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

describe("App", () => {
  it("deactivates admin mode when navigating to users tab", async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/"]}>
        <UserDataProvider>
          <App />
        </UserDataProvider>
      </MemoryRouter>,
    );

    // Activate admin mode
    const toggleButton = screen.getByText("Toggle Admin Mode");
    fireEvent.click(toggleButton);

    expect(require("./hooks/useUserData").default().isAdminMode).toBe(true);

    // Mock the updated state after activating admin mode
    jest.mock("./hooks/useUserData", () => ({
      __esModule: true,
      default: () => ({
        user: { id: "user1", isAdmin: true },
        isLoggedIn: true,
        isAdminMode: true,
        toggleAdminMode: jest.fn(),
        // ... other necessary properties
      }),
    }));

    // Force a re-render to apply the updated mock
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <UserDataProvider>
          <App />
        </UserDataProvider>
      </MemoryRouter>,
    );

    // Navigate to the Users tab
    const usersLink = screen.getByText("Users");
    fireEvent.click(usersLink);

    // Wait for the navigation to complete
    await waitFor(() => {
      expect(screen.getByText("Users Component")).toBeInTheDocument();
    });

    // Verify that admin mode is deactivated
    expect(require("./hooks/useUserData").default().isAdminMode).toBe(false);
  });
});
