import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { UserDataProvider, useUserDataContext } from "./UserDataContext";
import { MemoryRouter } from "react-router-dom";

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
}));

jest.mock("../hooks/useUserData", () => ({
  __esModule: true,
  default: () => ({
    user: null,
    isLoggedIn: false,
    setIsLoggedIn: jest.fn(),
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    userProgress: [],
    fetchUserProfile: jest.fn(),
  }),
}));

const TestComponent: React.FC = () => {
  const { isAdminMode, toggleAdminMode, user, logout } = useUserDataContext();
  return (
    <div>
      <div data-testid="admin-mode">{isAdminMode ? "true" : "false"}</div>
      <button onClick={toggleAdminMode}>Toggle Admin Mode</button>
      <div data-testid="user-admin">{user?.isAdmin ? "true" : "false"}</div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe("UserDataContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with admin mode off", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );
    expect(getByTestId("admin-mode")).toHaveTextContent("false");
  });

  it("should not toggle admin mode when user is not admin", async () => {
    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );
    await act(async () => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("false");
  });

  it("should toggle admin mode when user is admin", async () => {
    jest
      .spyOn(require("../hooks/useUserData"), "default")
      .mockImplementation(() => ({
        user: { isAdmin: true },
        isLoggedIn: true,
        setIsLoggedIn: jest.fn(),
        login: jest.fn(),
        logout: jest.fn().mockResolvedValue(undefined),
        userProgress: [],
        fetchUserProfile: jest.fn(),
      }));

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );
    expect(getByTestId("user-admin")).toHaveTextContent("true");
    await act(async () => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("true");
    await act(async () => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("false");
  });

  it("should turn off admin mode on logout", async () => {
    jest
      .spyOn(require("../hooks/useUserData"), "default")
      .mockImplementation(() => ({
        user: { isAdmin: true },
        isLoggedIn: true,
        setIsLoggedIn: jest.fn(),
        login: jest.fn(),
        logout: jest.fn().mockResolvedValue(undefined),
        userProgress: [],
        fetchUserProfile: jest.fn(),
      }));

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );

    // Enable admin mode
    await act(async () => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("true");

    // Logout
    await act(async () => {
      getByText("Logout").click();
    });

    // Check that admin mode is turned off
    await waitFor(() => {
      expect(getByTestId("admin-mode")).toHaveTextContent("false");
      expect(localStorage.getItem("isAdminMode")).toBe("false");
    });
  });
});
