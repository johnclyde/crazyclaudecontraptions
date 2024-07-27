import React, { useState, useRef, useEffect } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
};

const MockNotificationBell = React.forwardRef<
  HTMLDivElement,
  NotificationBellProps
>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button
        ref={ref}
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        NotificationBell
      </button>
      {isOpen && (
        <div data-testid="notification-dropdown">Notification Content</div>
      )}
    </div>
  );
});

const MockUserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useOutsideClick(() => setIsOpen(false));

    return (
      <div ref={menuRef}>
        <button
          ref={ref}
          aria-label="User menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          UserMenu
        </button>
        {isOpen && <div data-testid="user-menu-dropdown">Menu Content</div>}
      </div>
    );
  },
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

  it("closes notification dropdown when clicking outside", async () => {
    renderHeader({}, { ...mockUserDataContext, isLoggedIn: true });
    const notificationBell = screen.getByLabelText("Notifications");

    fireEvent.click(notificationBell);
    expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(
        screen.queryByTestId("notification-dropdown"),
      ).not.toBeInTheDocument();
    });
  });

  it("closes user menu when clicking outside", async () => {
    renderHeader();
    const userMenuButton = screen.getByLabelText("User menu");

    fireEvent.click(userMenuButton);
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(
        screen.queryByTestId("user-menu-dropdown"),
      ).not.toBeInTheDocument();
    });
  });
});
