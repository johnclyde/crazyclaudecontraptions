import React from "react";
import { render, act, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import {
  UserDataContextType,
  useUserDataContext,
} from "../contexts/UserDataContext";
import { MemoryRouter, BrowserRouter } from "react-router-dom";
import { User } from "../types";
import * as UserDataContext from "../contexts/UserDataContext";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
}));

global.fetch = jest.fn();

const mockUser: User = {
  id: "1",
  isAdmin: true,
  isStaff: true,
  name: "Frank Drebbin",
  email: "mrdrebbin@example.com",
  avatar: "",
  createdAt: "2023-01-01",
  lastLogin: "2023-01-01",
  points: 0,
  role: "User",
  progress: [],
};

const mockUserDataContext: UserDataContextType = {
  user: mockUser,
  isLoggedIn: true,
  bypassLogin: jest.fn(),
  setIsLoggedIn: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  userProgress: [],
  isAdminMode: true,
  toggleAdminMode: jest.fn(),
};

jest.mock("../contexts/UserDataContext", () => ({
  ...jest.requireActual("../contexts/UserDataContext"),
  useUserDataContext: jest.fn(),
}));

const renderUsers = () => {
  return render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>,
  );
};

describe("Users component", () => {
  beforeEach(() => {
    (useUserDataContext as jest.Mock).mockReturnValue(mockUserDataContext);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderUsers();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display users", async () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com", status: "user" },
      { id: "2", name: "Jane Doe", email: "jane@example.com", status: "admin" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
  });

  it("should handle empty response from API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
    });
  });

  it("should handle error when fetching users", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    renderUsers();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load users. Please try again later."),
      ).toBeInTheDocument();
    });
  });

  it("should not render for non-admin users", async () => {
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      user: { ...mockUser, isAdmin: false },
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users")).not.toBeInTheDocument();
    });
  });

  it("should not render when admin mode is off", async () => {
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      isAdminMode: false,
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users")).not.toBeInTheDocument();
    });
  });
});

describe("Users Component Behavior", () => {
  let fetchCount = 0;
  let consoleLogCount = 0;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    fetchCount = 0;
    consoleLogCount = 0;
    jest.useFakeTimers();

    global.fetch = jest.fn().mockImplementation(() => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: async () => ({ users: [] }),
      });
    });

    console.log = jest.fn((...args) => {
      consoleLogCount++;
      originalConsoleLog(...args);
    });

    console.error = jest.fn();

    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("fetches users only once when mounted", async () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>,
    );

    // Run all timers to trigger any scheduled effects
    await act(async () => {
      jest.runAllTimers();
    });

    console.log(`Fetch called ${fetchCount} times`);
    console.log(`Console.log called ${consoleLogCount} times`);

    expect(fetchCount).toBe(1);
    expect(consoleLogCount).toBeLessThanOrEqual(10);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should not fetch users when not in admin mode", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: false,
    } as any);

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>,
    );

    await act(async () => {
      jest.runAllTimers();
    });

    expect(fetchCount).toBe(0);
  });
});
