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

  it("should render for non-admin users", async () => {
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      user: { ...mockUser, isAdmin: false },
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
    });
  });

  it("should render when admin mode is off", async () => {
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      isAdminMode: false,
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
    });
  });
});

describe("Users Component DoS Detection", () => {
  let fetchMock: jest.Mock;
  let apiCallCount: number;
  const API_CALL_THRESHOLD = 10; // Adjust this as needed
  const TIME_WINDOW_MS = 1000; // 1 second

  beforeEach(() => {
    apiCallCount = 0;
    fetchMock = jest.fn().mockImplementation(() => {
      apiCallCount++;
      if (apiCallCount > API_CALL_THRESHOLD) {
        throw new Error("DoS detected");
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ users: [] }),
      });
    });
    global.fetch = fetchMock;

    jest
      .spyOn(UserDataContext, "useUserDataContext")
      .mockImplementation(() => ({
        ...mockUserDataContext,
        isAdminMode: true,
      }));
  });

  it("detects and stops DoS behavior", async () => {
    const dosDetected = jest.fn();

    try {
      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>,
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, TIME_WINDOW_MS));
      });
    } catch (error) {
      if (error.message === "DoS detected") {
        dosDetected();
      } else {
        throw error;
      }
    }

    expect(dosDetected).toHaveBeenCalled();
    expect(apiCallCount).toBeGreaterThan(API_CALL_THRESHOLD);
  });
});
