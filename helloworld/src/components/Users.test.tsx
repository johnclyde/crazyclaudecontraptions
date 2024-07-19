import React from "react";
import { render, screen } from "@testing-library/react";
import Users from "./Users";
import * as useAdminUsersModule from "../hooks/useAdminUsers";

describe("Users component", () => {
  let mockUseAdminUsers: jest.SpyInstance;

  beforeEach(() => {
    mockUseAdminUsers = jest.spyOn(useAdminUsersModule, "default");
  });

  afterEach(() => {
    mockUseAdminUsers.mockRestore();
  });

  it("should render loading state initially", () => {
    mockUseAdminUsers.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      fetchUsers: jest.fn(),
    });

    render(<Users />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display users", () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ];
    mockUseAdminUsers.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      fetchUsers: jest.fn(),
    });

    render(<Users />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should display error message on fetch failure", () => {
    mockUseAdminUsers.mockReturnValue({
      users: [],
      loading: false,
      error: "Failed to load users. Please try again later.",
      fetchUsers: jest.fn(),
    });

    render(<Users />);
    expect(
      screen.getByText("Failed to load users. Please try again later."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should handle empty response from API", () => {
    mockUseAdminUsers.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      fetchUsers: jest.fn(),
    });

    render(<Users />);
    expect(screen.getByText("No users found.")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
