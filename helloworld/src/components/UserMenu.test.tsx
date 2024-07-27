import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
    </BrowserRouter>,
  );
};

describe("UserMenu", () => {
  it("renders login button when not logged in", async () => {
    renderUserMenu();
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders user menu when logged in", async () => {
    renderUserMenu({ isLoggedIn: true, user: mockUser });
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders admin mode toggle for admin users", async () => {
    renderUserMenu({ isLoggedIn: true, user: mockUser });
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByText("Enable Admin Mode")).toBeInTheDocument();
  });

  it("toggles admin mode when clicking the toggle button", async () => {
    const toggleAdminMode = jest.fn();
    renderUserMenu({
      isLoggedIn: true,
      user: mockUser,
      toggleAdminMode,
      isAdminMode: false,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Enable Admin Mode"));
    });
    expect(toggleAdminMode).toHaveBeenCalled();
  });

  it("calls logout function when clicking logout", async () => {
    const logout = jest.fn();
    renderUserMenu({ isLoggedIn: true, user: mockUser, logout });
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Logout"));
    });
    expect(logout).toHaveBeenCalled();
  });
});
