import React from "react";
import { render, act, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import {
  UserDataContextType,
  useUserDataContext,
} from "../contexts/UserDataContext";
import { MemoryRouter } from "react-router-dom";
import { User } from "../types";

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
      expect(screen.getByText("Users Page")).toBeInTheDocument();
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
      expect(screen.getByText("Users Page")).toBeInTheDocument();
    });
  });

  it("should render when admin mode is off", async () => {
    (useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserDataContext,
      isAdminMode: false,
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users Page")).toBeInTheDocument();
    });
  });
});
