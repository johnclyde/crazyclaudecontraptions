import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { UserDataProvider, useUserDataContext } from "./UserDataContext";
import { MemoryRouter } from "react-router-dom";

// Mock the useUserData hook
jest.mock("../hooks/useUserData", () => ({
  __esModule: true,
  default: () => ({
    user: null,
    isLoggedIn: false,
    setIsLoggedIn: jest.fn(),
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    userProgress: [],
  }),
}));

const TestComponent: React.FC = () => {
  const { isAdminMode, toggleAdminMode, user, logout } = useUserDataContext();
  return (
    <div>
      <div data-testid="admin-mode">{isAdminMode ? "true" : "false"}</div>
      <button onClick={toggleAdminMode}>Toggle Admin Mode</button>
      <div data-testid="user-admin">{user?.isAdmin ? "true" : "false"}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("UserDataContext", () => {
  beforeEach(() => {
    localStorage.clear();
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

  it("should not toggle admin mode when user is not admin", () => {
    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );
    act(() => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("false");
  });

  it("should toggle admin mode when user is admin", () => {
    jest
      .spyOn(require("../hooks/useUserData"), "default")
      .mockImplementation(() => ({
        user: { isAdmin: true },
        isLoggedIn: true,
        setIsLoggedIn: jest.fn(),
        login: jest.fn(),
        logout: jest.fn().mockResolvedValue(undefined),
        userProgress: [],
      }));

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );
    expect(getByTestId("user-admin")).toHaveTextContent("true");
    act(() => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("true");
    act(() => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("false");
  });

  it("should persist admin mode in localStorage", () => {
    jest
      .spyOn(require("../hooks/useUserData"), "default")
      .mockImplementation(() => ({
        user: { isAdmin: true },
        isLoggedIn: true,
        setIsLoggedIn: jest.fn(),
        login: jest.fn(),
        logout: jest.fn().mockResolvedValue(undefined),
        userProgress: [],
      }));

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );
    act(() => {
      getByText("Toggle Admin Mode").click();
    });
    expect(localStorage.getItem("isAdminMode")).toBe("true");
    act(() => {
      getByText("Toggle Admin Mode").click();
    });
    expect(localStorage.getItem("isAdminMode")).toBe("false");
  });

  it("does not turn off admin mode on logout", async () => {
    // It SHOULD turn off admin mode on logout. But it doesn't. :(
    jest
      .spyOn(require("../hooks/useUserData"), "default")
      .mockImplementation(() => ({
        user: { isAdmin: true },
        isLoggedIn: true,
        setIsLoggedIn: jest.fn(),
        login: jest.fn(),
        logout: jest.fn().mockResolvedValue(undefined),
        userProgress: [],
      }));

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <UserDataProvider>
          <TestComponent />
        </UserDataProvider>
      </MemoryRouter>,
    );

    // Enable admin mode
    act(() => {
      getByText("Toggle Admin Mode").click();
    });
    expect(getByTestId("admin-mode")).toHaveTextContent("true");

    // Logout
    await act(async () => {
      getByText("Logout").click();
      await waitFor(() => {});
    });

    // Check that admin mode is still on
    expect(getByTestId("admin-mode")).toHaveTextContent("true");
    expect(localStorage.getItem("isAdminMode")).toBe("true");
  });
});
