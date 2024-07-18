import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Users from "./Users";
import useAdminUsers from "../hooks/useAdminUsers";

// Mock the custom hook
jest.mock("../hooks/useAdminUsers");

// Mock the Firebase auth
jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
}));

describe("Users component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render loading state initially", async () => {
    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [],
      loading: true,
      error: null,
      fetchUsers: jest.fn(),
    });

    await act(async () => {
      render(<Users />);
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display users", async () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ];

    (useAdminUsers as jest.Mock).mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      fetchUsers: jest.fn(),
    });

    await act(async () => {
      render(<Users />);
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should display error message on fetch failure", async () => {
    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [],
      loading: false,
      error: "Failed to load users. Please try again later.",
      fetchUsers: jest.fn(),
    });

    await act(async () => {
      render(<Users />);
    });

    expect(
      screen.getByText("Error: Failed to load users. Please try again later."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should handle empty response from API", async () => {
    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [],
      loading: false,
      error: null,
      fetchUsers: jest.fn(),
    });

    await act(async () => {
      render(<Users />);
    });

    expect(screen.getByText("No users found.")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
