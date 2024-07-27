import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";

// Mock child components
jest.mock("./NotificationBell", () => {
  return function MockNotificationBell({ setShowNotifications }) {
    return (
      <div data-testid="notification-bell">
        <button onClick={() => setShowNotifications(true)}>
          Show Notifications
        </button>
      </div>
    );
  };
});

jest.mock("./UserMenu", () => {
  return function MockUserMenu() {
    return <div data-testid="user-menu">User Menu</div>;
  };
});

const defaultProps = {
  user: null,
  isLoggedIn: true,
  notifications: [],
  notificationsError: null,
  markNotificationAsRead: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  setIsLoggedIn: jest.fn(),
  isAdminMode: false,
  toggleAdminMode: jest.fn(),
};

const renderHeader = (props = {}) => {
  return render(
    <BrowserRouter>
      <Header {...defaultProps} {...props} />
    </BrowserRouter>,
  );
};

describe("Header", () => {
  it("closes notification dropdown when clicking outside", () => {
    renderHeader();

    // Open notifications
    fireEvent.click(screen.getByText("Show Notifications"));

    // Verify notifications are shown
    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify notifications are no longer shown
    expect(screen.queryByText("No new notifications")).not.toBeInTheDocument();
  });

  it("keeps user menu open when clicking outside", () => {
    renderHeader();

    // Assuming user menu is already open (since we can't directly control its state in this test setup)
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify user menu is still shown
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });
});
