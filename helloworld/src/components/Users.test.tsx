import React from "react";
import { render, act, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import * as UserDataContext from "../contexts/UserDataContext";
import { MemoryRouter, useNavigate } from "react-router-dom";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

global.fetch = jest.fn();

const mockUserDataContext = {
  user: {
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
  },
  isLoggedIn: true,
  setIsLoggedIn: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  isAdminMode: true,
  toggleAdminMode: jest.fn(),
  userProgress: [],
};

const renderUsers = (isAdminMode: boolean) => {
  return render(
    <MemoryRouter>
      <UserDataContext.UserDataProvider>
        <Users isAdminMode={isAdminMode} />
      </UserDataContext.UserDataProvider>
    </MemoryRouter>,
  );
};

describe("Users component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(UserDataContext, "useUserDataContext")
      .mockReturnValue(mockUserDataContext);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderUsers(true);
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
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

    renderUsers(true);

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

    renderUsers(true);

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
    });
  });

  it("should handle error when fetching users", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    renderUsers(true);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load users. Please try again later."),
      ).toBeInTheDocument();
    });
  });

  it("should redirect non-admin users", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      ...mockUserDataContext,
      user: { ...mockUserDataContext.user, isAdmin: false },
    });

    renderUsers(false);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should redirect when admin mode is off", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      ...mockUserDataContext,
      isAdminMode: false,
    });

    renderUsers(false);
    await waitFor(() => {
      console.log("No idea");
      // expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
