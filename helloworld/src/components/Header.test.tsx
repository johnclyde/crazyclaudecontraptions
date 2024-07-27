import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

const defaultProps = {
  user: null,
  isLoggedIn: false,
  notifications: [
    {
      id: "1",
      message: "Test notification",
      timestamp: "2023-05-01",
      read: false,
    },
  ],
  notificationsError: null,
  markNotificationAsRead: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  setIsLoggedIn: jest.fn(),
  isAdminMode: false,
  toggleAdminMode: jest.fn(),
  NotificationBell,
  UserMenu,
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
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("doesn't render NotificationBell when not logged in", () => {
    renderHeader({ isLoggedIn: false });
    expect(
      screen.queryByRole("button", { name: /notifications/i }),
    ).not.toBeInTheDocument();
  });

  it("renders UserMenu", () => {
    renderHeader();
    expect(
      screen.getByRole("button", { name: /user menu/i }),
    ).toBeInTheDocument();
  });

  it("closes notification dropdown when clicking outside", async () => {
    renderHeader({ isLoggedIn: true });
    const notificationBell = screen.getByRole("button", {
      name: /notifications/i,
    });

    // Open notifications
    fireEvent.click(notificationBell);
    expect(screen.getByText("Test notification")).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify notifications are closed
    expect(screen.queryByText("Test notification")).not.toBeInTheDocument();
  });

  it("keeps user menu open when clicking outside", async () => {
    renderHeader();
    const userMenuButton = screen.getByRole("button", { name: /user menu/i });

    // Open user menu
    fireEvent.click(userMenuButton);
    const menuItem = screen.getByText("Login");
    expect(menuItem).toBeInTheDocument();

    // Click outside (on the header container)
    fireEvent.mouseDown(screen.getByRole("banner"));

    // Verify user menu is still open
    expect(menuItem).toBeInTheDocument();
  });
});
