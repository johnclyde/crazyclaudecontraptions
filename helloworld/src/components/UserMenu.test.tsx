import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserMenu from "./UserMenu";
import { UserDataProvider } from "../contexts/UserDataContext";

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Logout successful" }),
  }),
) as jest.Mock;

// Mock the Firebase auth
jest.mock("../firebase", () => ({
  auth: {
    signOut: jest.fn(),
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    },
  },
}));

describe("UserMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls logout endpoint when logout is clicked", async () => {
    const mockLogout = jest.fn();
    render(
      <UserDataProvider value={{ isLoggedIn: true, logout: mockLogout }}>
        <UserMenu bypassLogin={() => {}} />
      </UserDataProvider>,
    );

    // Open the menu
    fireEvent.click(screen.getByRole("button"));

    // Click the logout button
    fireEvent.click(screen.getByText("Logout"));

    // Wait for the logout function to be called
    await waitFor(() => expect(mockLogout).toHaveBeenCalled());

    // Verify that the fetch function was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/logout",
      expect.any(Object),
    );
  });

  it("does not show logout option when user is not logged in", () => {
    render(
      <UserDataProvider value={{ isLoggedIn: false, logout: jest.fn() }}>
        <UserMenu bypassLogin={() => {}} />
      </UserDataProvider>,
    );

    // Open the menu
    fireEvent.click(screen.getByRole("button"));

    // Check that the logout option is not present
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });
});
