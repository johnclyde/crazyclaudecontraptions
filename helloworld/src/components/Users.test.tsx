import React from "react";
import { render, act, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import {
  UserDataContextType,
  useUserDataContext,
} from "../contexts/UserDataContext";
import { MemoryRouter } from "react-router-dom";
import { User } from "../types";
import * as UserDataContext from "../contexts/UserDataContext";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

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

const renderUsers = (contextOverrides = {}) => {
  const contextValue = { ...mockUserDataContext, ...contextOverrides };
  (useUserDataContext as jest.Mock).mockReturnValue(contextValue);
  return render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>,
  );
};

describe("Users component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [mockUser] }),
    });
  });

  // Keep existing tests
  it("should render loading state initially", async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    renderUsers();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display users", async () => {
    renderUsers();
    await waitFor(() => {
      expect(screen.getByText("Frank Drebbin")).toBeInTheDocument();
      expect(screen.getByText("mrdrebbin@example.com")).toBeInTheDocument();
    });
  });

  it("should handle empty response from API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });
    renderUsers();
    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.queryByText("Frank Drebbin")).not.toBeInTheDocument();
    });
  });

  it("should handle error when fetching users", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API error"));
    renderUsers();
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load users. Please try again later."),
      ).toBeInTheDocument();
    });
  });

  it("should not render for non-admin users", async () => {
    renderUsers({ user: { ...mockUser, isAdmin: false } });
    await waitFor(() => {
      expect(screen.queryByText("Users")).not.toBeInTheDocument();
    });
  });

  it("should not render when admin mode is off", async () => {
    renderUsers({ isAdminMode: false });
    await waitFor(() => {
      expect(screen.queryByText("Users")).not.toBeInTheDocument();
    });
  });

  // Add new tests
  it("should fetch users only once when mounted", async () => {
    renderUsers();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should re-fetch users when admin status changes", async () => {
    const { rerender } = renderUsers({ user: { ...mockUser, isAdmin: false } });
    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });

    rerender(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      user: { ...mockUser, isAdmin: true },
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should re-fetch users when admin mode changes", async () => {
    const { rerender } = renderUsers({ isAdminMode: false });
    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });

    rerender(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      isAdminMode: true,
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should not re-fetch when unrelated user properties change", async () => {
    const { rerender } = renderUsers();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      user: { ...mockUser, name: "Jane Doe" },
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
