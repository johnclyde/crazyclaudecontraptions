import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import * as UserDataContext from "../contexts/UserDataContext";
import { MemoryRouter } from "react-router-dom";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn(),
}));

global.fetch = jest.fn();

const mockUserDataContext = {
  user: { isAdmin: true },
  isLoggedIn: true,
  login: jest.fn(),
  logout: jest.fn(),
  isAdminMode: true,
  toggleAdminMode: jest.fn(),
};

const renderUsers = (props = {}) => {
  return render(
    <MemoryRouter>
      <UserDataContext.UserDataProvider>
        <Users isAdminMode={true} {...props} />
      </UserDataContext.UserDataProvider>
    </MemoryRouter>,
  );
};

describe("Users component", () => {
  beforeEach(() => {
    jest
      .spyOn(UserDataContext, "useUserDataContext")
      .mockReturnValue(mockUserDataContext);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderUsers();
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
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
});
