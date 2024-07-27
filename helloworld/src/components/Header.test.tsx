import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";

const MockNotificationBell = ({ notifications, showNotifications }) => {
  return (
    <div>
      {showNotifications && (
        <div data-testid="notification-dropdown">
          Notifications: {notifications.length}
        </div>
      )}
    </div>
  );
};

const MockUserMenu = ({ showMenu }) => {
  return (
    <div>
      {showMenu && (
        <div data-testid="user-menu-dropdown">User Menu Content</div>
      )}
    </div>
  );
};

const defaultProps = {
  user: null,
  isLoggedIn: false,
  notifications: [],
  notificationsError: null,
  markNotificationAsRead: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  setIsLoggedIn: jest.fn(),
  isAdminMode: false,
  toggleAdminMode: jest.fn(),
  NotificationBell: MockNotificationBell,
  UserMenu: MockUserMenu,
};

const renderHeader = (props = {}) => {
  return render(
    <Router>
      <Header {...defaultProps} {...props} />
    </Router>,
  );
};

describe("Header", () => {
  it("renders GrindOlympiads link", () => {
    renderHeader();
    expect(screen.getByText("GrindOlympiads")).toBeInTheDocument();
  });

  it("renders NotificationBell when logged in", () => {
    renderHeader({ isLoggedIn: true });
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("doesn't render NotificationBell when not logged in", () => {
    renderHeader({ isLoggedIn: false });
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  it("renders UserMenu", () => {
    renderHeader();
    expect(screen.getByText("User Menu Content")).toBeInTheDocument();
  });

  it("closes notification dropdown when clicking outside", () => {
    renderHeader({ isLoggedIn: true });

    // Open notifications
    fireEvent.click(screen.getByText("Notifications"));
    expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify notifications are closed
    expect(
      screen.queryByTestId("notification-dropdown"),
    ).not.toBeInTheDocument();
  });

  it("keeps user menu open when clicking outside", () => {
    renderHeader();

    // Open user menu
    fireEvent.click(screen.getByText("User Menu Content"));
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify user menu is still open
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();
  });
});
