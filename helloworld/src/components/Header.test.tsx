import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import { NotificationBellProps } from "./NotificationBell";
import { UserMenuProps } from "./UserMenu";
import { NotificationType } from "../types";
import * as UserDataContext from "../contexts/UserDataContext";

// Mock the useUserDataContext hook
jest.mock("../contexts/UserDataContext", () => ({
  useUserDataContext: jest.fn(),
}));

const MockNotificationBell = React.forwardRef<
  HTMLDivElement,
  NotificationBellProps
>((props, ref) => (
  <button ref={ref} aria-label="Notifications">
    NotificationBell
  </button>
));

const MockUserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  (props, ref) => (
    <button ref={ref} aria-label="User menu">
      UserMenu
    </button>
  ),
);

const mockUserDataContext = {
  user: null,
  isLoggedIn: false,
  login: jest.fn(),
  logout: jest.fn(),
  isAdminMode: false,
  toggleAdminMode: jest.fn(),
};

const defaultProps = {
  notifications: [] as NotificationType[],
  notificationsError: null,
  markNotificationAsRead: jest.fn(),
  NotificationBell: MockNotificationBell,
  UserMenu: MockUserMenu,
};

const renderHeader = (props = {}, contextValue = mockUserDataContext) => {
  (UserDataContext.useUserDataContext as jest.Mock).mockReturnValue(
    contextValue,
  );
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
    renderHeader({}, { ...mockUserDataContext, isLoggedIn: true });
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("doesn't render NotificationBell when not logged in", () => {
    renderHeader();
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

  it("closes notification dropdown when clicking outside", () => {
    renderHeader({}, { ...mockUserDataContext, isLoggedIn: true });
    const notificationBell = screen.getByRole("button", {
      name: /notifications/i,
    });

    fireEvent.click(notificationBell);
    expect(screen.getByText("Test notification")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Test notification")).not.toBeInTheDocument();
  });

  it("closes user menu when clicking outside", () => {
    renderHeader();
    const userMenuButton = screen.getByRole("button", { name: /user menu/i });

    fireEvent.click(userMenuButton);
    expect(screen.getByText("Login")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });
});
