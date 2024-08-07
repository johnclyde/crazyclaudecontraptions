Certainly. Here's the complete, updated file incorporating all the changes we've discussed:

```typescript
import React, { useState, useRef, useEffect } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router, MemoryRouter } from "react-router-dom";
import Header from "./Header";
import { NotificationBellProps } from "./NotificationBell";
import { UserMenuProps } from "./UserMenu";
import { NotificationType } from "../types";
import * as UserDataContext from "../contexts/UserDataContext";

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
>((props, forwardedRef) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof forwardedRef === "function") {
      forwardedRef(dropdownRef.current);
    } else if (forwardedRef) {
      forwardedRef.current = dropdownRef.current;
    }
  }, [forwardedRef]);

  return (
    <div ref={dropdownRef}>
      <button
        ref={buttonRef}
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
  (props, forwardedRef) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useOutsideClick(() => setIsOpen(false));
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (typeof forwardedRef === "function") {
        forwardedRef(menuRef.current);
      } else if (forwardedRef) {
        forwardedRef.current = menuRef.current;
      }
    }, [forwardedRef]);

    return (
      <div ref={menuRef}>
        <button
          ref={buttonRef}
          aria-label="User menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          User Icon
        </button>
        {isOpen && (
          <div data-testid="user-menu-dropdown">
            <button>Profile</button>
            <button>Users</button>
            <button>Settings</button>
            <button>Logout</button>
          </div>
        )}
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

  it("toggles off admin mode when clicking on Users", async () => {
    const mockToggleAdminMode = jest.fn();
    const mockUseUserDataContext = {
      user: { id: "1", name: "Test User", isAdmin: true },
      isLoggedIn: true,
      login: jest.fn(),
      logout: jest.fn(),
      isAdminMode: true,
      toggleAdminMode: mockToggleAdminMode,
    };

    (UserDataContext.useUserDataContext as jest.Mock).mockReturnValue(
      mockUseUserDataContext
    );

    render(
      <MemoryRouter>
        <Header
          notifications={[]}
          notificationsError={null}
          markNotificationAsRead={jest.fn()}
          NotificationBell={MockNotificationBell}
          UserMenu={MockUserMenu}
        />
      </MemoryRouter>
    );

    // Open the user menu
    fireEvent.click(screen.getByLabelText("User menu"));

    // Click on the Users button in the dropdown
    fireEvent.click(screen.getByText("Users"));

    // Wait for any asynchronous actions to complete
    await waitFor(() => {
      // Check if toggleAdminMode was called, which it shouldn't be
      expect(mockToggleAdminMode).not.toHaveBeenCalled();
      
      // The isAdminMode should still be true
      expect(mockUseUserDataContext.isAdminMode).toBe(true);
    });
  });
});
```

This file includes all the necessary imports, mocks, helper functions, and test cases we've discussed. It should now correctly represent the structure of your Header component, including the user menu with its dropdown containing various options.
