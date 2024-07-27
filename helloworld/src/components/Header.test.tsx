import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";

// Mock components with click behavior
const MockNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div data-testid="notification-bell">
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Notifications</button>
      {isOpen && <div data-testid="notification-dropdown">Notifications</div>}
    </div>
  );
};

const MockUserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div data-testid="user-menu">
      <button onClick={() => setIsOpen(!isOpen)}>Toggle User Menu</button>
      {isOpen && <div data-testid="user-menu-dropdown">User Menu</div>}
    </div>
  );
};

const defaultProps = {
  NotificationBell: MockNotificationBell,
  UserMenu: MockUserMenu,
  isLoggedIn: true,
  isAdminMode: false,
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
