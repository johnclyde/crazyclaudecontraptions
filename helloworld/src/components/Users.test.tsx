import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Users from "./Users";
import Users from "./Users";
import useAdminUsers from "../hooks/useAdminUsers";

// Mock the custom hook
jest.mock("../hooks/useAdminUsers");

describe("Users Component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("displays loading state initially", async () => {
    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [],
      loading: true,
      error: null,
    });

    render(<Users />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("fetches and displays users", async () => {
    const mockUsers = [
      { id: "1", name: "User 1", email: "user1@example.com" },
      { id: "2", name: "User 2", email: "user2@example.com" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(<Users />);

  it("should fetch and display users", async () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ];

    (useAdminUsers as jest.Mock).mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    for (const user of mockUsers) {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/admin_users",
    );
  });

  it("handles fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch users"),
    );

    render(<Users />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("Failed to load users. Please try again later."),
    ).toBeInTheDocument();
  });

  it("displays message when no users are found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should display error message on fetch failure", async () => {
    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [],
      loading: false,
      error: "Failed to load users. Please try again later.",
    });

    render(<Users />);

    expect(
      screen.getByText("Failed to load users. Please try again later."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should handle empty response from API", async () => {
    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [],
      loading: false,
      error: null,
    });

    render(<Users />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No users found.")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
