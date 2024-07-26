
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import UserMenu from "./UserMenu";
import { BrowserRouter } from "react-router-dom";

const mockUser = {
  id: "user123",
  name: "Test User",
  email: "test@example.com",
  avatar: "avatar-url",
  isAdmin: true,
  isStaff: false,
  createdAt: "2023-01-01",
  lastLogin: "2023-05-01",
  points: 100,
  role: "Admin",
  progress: [],
};

const defaultProps = {
  user: null,
  isLoggedIn: false,
  login: jest.fn(),
  logout: jest.fn(),
  isAdminMode: false,
  toggleAdminMode: jest.fn(),
};

const renderUserMenu = (props = {}) => {
  return render(
    <BrowserRouter>
      <UserMenu {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe("UserMenu", () => {
  it("renders login button when not logged in", () => {
    renderUserMenu();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders user menu when logged in", () => {
    renderUserMenu({ isLoggedIn: true, user: mockUser });
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders admin mode toggle for admin users", () => {
    renderUserMenu({ isLoggedIn: true, user: mockUser });
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Enable Admin Mode")).toBeInTheDocument();
  });

  it("toggles admin mode when clicking the toggle button", () => {
    const toggleAdminMode = jest.fn();
    renderUserMenu({
      isLoggedIn: true,
      user: mockUser,
      toggleAdminMode,
      isAdminMode: false,
    });
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Enable Admin Mode"));
    expect(toggleAdminMode).toHaveBeenCalled();
  });

  it("calls logout function when clicking logout", () => {
    const logout = jest.fn();
    renderUserMenu({ isLoggedIn: true, user: mockUser, logout });
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Logout"));
    expect(logout).toHaveBeenCalled();
  });

  it("renders staging login button when provided", () => {
    const stagingLogin = jest.fn();
    renderUserMenu({ stagingLogin });
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Log in as math1434")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Log in as math1434"));
    expect(stagingLogin).toHaveBeenCalled();
  });
});
