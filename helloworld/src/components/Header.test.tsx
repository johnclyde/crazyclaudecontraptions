import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";

const MockNotificationBell = ({ notifications }) => (
  <div data-testid="notification-dropdown">
    Notifications: {notifications.length}
  </div>
);

const MockUserMenu = () => <div>User Menu</div>;

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
    expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
  });

  it("doesn't render NotificationBell when not logged in", () => {
    renderHeader({ isLoggedIn: false });
    expect(
      screen.queryByTestId("notification-dropdown"),
    ).not.toBeInTheDocument();
  });

  it("renders UserMenu", () => {
    renderHeader();
    expect(screen.getByText("User Menu")).toBeInTheDocument();
  });

  it("closes notification dropdown when clicking outside", () => {
    renderHeader();
    // Open notifications
    fireEvent.click(screen.getByText("Toggle Notifications"));
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
    fireEvent.click(screen.getByText("Toggle User Menu"));
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify user menu is still open
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();
  });
});
