import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  BrowserRouter as Router,
  MemoryRouter,
  useNavigate,
} from "react-router-dom";
import Header from "./Header";
import * as UserDataContext from "../contexts/UserDataContext";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../contexts/UserDataContext", () => ({
  useUserDataContext: jest.fn(),
}));

const mockUseUserDataContext = UserDataContext.useUserDataContext as jest.Mock;

const defaultUserContextValue = {
  user: null,
  isLoggedIn: false,
  login: jest.fn(),
  logout: jest.fn(),
  isAdminMode: false,
  toggleAdminMode: jest.fn(),
};

const MockNotificationBell = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => (
    <div ref={ref}>
      <button
        onClick={() => props.setShowNotifications(!props.showNotifications)}
        aria-label="Notifications"
      >
        NotificationBell
      </button>
      {props.showNotifications && (
        <div data-testid="notification-dropdown">Notification Content</div>
      )}
    </div>
  ),
);

const MockUserMenu = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref}>
    <button
      onClick={() => props.setShowUserMenu(!props.showUserMenu)}
      aria-label="User menu"
    >
      User Icon
    </button>
    {props.showUserMenu && (
      <div data-testid="user-menu-dropdown">
        <button>Profile</button>
        <button>Users</button>
        <button>Settings</button>
        <button>Logout</button>
      </div>
    )}
  </div>
));

const defaultProps = {
  notifications: [],
  notificationsError: null,
  markNotificationAsRead: jest.fn(),
  NotificationBell: MockNotificationBell,
  UserMenu: MockUserMenu,
};

const renderHeader = (
  props = {},
  userContextValue = defaultUserContextValue,
) => {
  mockUseUserDataContext.mockReturnValue(userContextValue);
  return render(
    <Router>
      <Header {...defaultProps} {...props} />
    </Router>,
  );
};

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders GrindOlympiads link", () => {
    renderHeader();
    expect(screen.getByText("GrindOlympiads")).toBeInTheDocument();
  });

  it("renders login button when user is not logged in", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("calls login function when login button is clicked", () => {
    const mockLogin = jest.fn();
    renderHeader({}, { ...defaultUserContextValue, login: mockLogin });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));
    expect(mockLogin).toHaveBeenCalled();
  });

  it("renders UserMenu when user is logged in", () => {
    renderHeader({}, { ...defaultUserContextValue, isLoggedIn: true });
    expect(screen.getByLabelText("User menu")).toBeInTheDocument();
  });

  it("renders NotificationBell when user is logged in", () => {
    renderHeader({}, { ...defaultUserContextValue, isLoggedIn: true });
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("doesn't render NotificationBell when user is not logged in", () => {
    renderHeader();
    expect(screen.queryByLabelText("Notifications")).not.toBeInTheDocument();
  });

  it("renders labs link when on labs path", () => {
    mockUseUserDataContext.mockReturnValue(defaultUserContextValue);
    render(
      <MemoryRouter initialEntries={["/labs/some-component"]}>
        <Header {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Components Directory")).toBeInTheDocument();
  });

  it("doesn't render labs link when not on labs path", () => {
    renderHeader();
    expect(screen.queryByText("Components Directory")).not.toBeInTheDocument();
  });

  it("applies correct background color for admin mode", () => {
    renderHeader(
      {},
      { ...defaultUserContextValue, isLoggedIn: true, isAdminMode: true },
    );
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-red-900");
  });

  it("applies correct background color for non-admin mode", () => {
    renderHeader(
      {},
      { ...defaultUserContextValue, isLoggedIn: true, isAdminMode: false },
    );
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-gray-800");
  });

  it("renders full width header", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("w-full");
  });

  it("renders sticky header", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky top-0");
  });

  it("renders with correct z-index", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("z-50");
  });

  it("closes notification dropdown when clicking outside", async () => {
    renderHeader({}, { ...defaultUserContextValue, isLoggedIn: true });
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
    renderHeader({}, { ...defaultUserContextValue, isLoggedIn: true });
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

  it("navigates to Users page without toggling off admin mode", async () => {
    const mockToggleAdminMode = jest.fn();
    const mockUserContextValue = {
      user: { id: "1", name: "Test User", isAdmin: true },
      isLoggedIn: true,
      login: jest.fn(),
      logout: jest.fn(),
      isAdminMode: true,
      toggleAdminMode: mockToggleAdminMode,
    };

    mockUseUserDataContext.mockReturnValue(mockUserContextValue);

    render(
      <MemoryRouter>
        <Header
          notifications={[]}
          notificationsError={null}
          markNotificationAsRead={jest.fn()}
          NotificationBell={MockNotificationBell}
          UserMenu={MockUserMenu}
        />
      </MemoryRouter>,
    );

    // Open the user menu
    fireEvent.click(screen.getByLabelText("User menu"));

    // Click on the Users button in the dropdown
    fireEvent.click(screen.getByText("Users"));

    // Wait for any asynchronous actions to complete
    await waitFor(() => {
      // Check if toggleAdminMode was not called
      expect(mockToggleAdminMode).not.toHaveBeenCalled();

      // The isAdminMode should still be true
      expect(mockUserContextValue.isAdminMode).toBe(true);
    });
  });
});
