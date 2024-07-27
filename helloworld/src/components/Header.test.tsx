import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import { UserDataProvider } from "../contexts/UserDataContext";
import { NotificationType } from "../types";

// Mock the useNavigate hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const defaultProps = {
  notifications: [
    {
      id: "1",
      message: "Test notification",
      timestamp: "2023-05-01",
      read: false,
    },
  ] as NotificationType[],
  notificationsError: null,
  markNotificationAsRead: jest.fn(),
  NotificationBell,
  UserMenu,
};

// Mock the useUserDataContext hook
jest.mock("../contexts/UserDataContext", () => ({
  ...jest.requireActual("../contexts/UserDataContext"),
  useUserDataContext: () => ({
    user: null,
    isLoggedIn: false,
    login: jest.fn(),
    logout: jest.fn(),
    isAdminMode: false,
    toggleAdminMode: jest.fn(),
  }),
}));

const renderHeader = (props = {}) => {
  return render(
    <Router>
      <UserDataProvider>
        <Header {...defaultProps} {...props} />
      </UserDataProvider>
    </Router>,
  );
};

describe("Header", () => {
  it("renders GrindOlympiads link", () => {
    renderHeader();
    expect(screen.getByText("GrindOlympiads")).toBeInTheDocument();
  });

  it("renders NotificationBell when logged in", () => {
    jest
      .spyOn(require("../contexts/UserDataContext"), "useUserDataContext")
      .mockReturnValue({
        ...require("../contexts/UserDataContext").useUserDataContext(),
        isLoggedIn: true,
      });
    renderHeader();
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
    jest
      .spyOn(require("../contexts/UserDataContext"), "useUserDataContext")
      .mockReturnValue({
        ...require("../contexts/UserDataContext").useUserDataContext(),
        isLoggedIn: true,
      });
    renderHeader();
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
