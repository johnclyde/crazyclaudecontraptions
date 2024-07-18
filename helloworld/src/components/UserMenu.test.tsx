import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import UserMenu from "./UserMenu";
import { UserDataProvider } from "../contexts/UserDataContext";

// Mock the fetch function
const server = setupServer(
  rest.post(
    "https://us-central1-olympiads.cloudfunctions.net/logout",
    (req, res, ctx) => {
      return res(ctx.json({ message: "Logout successful" }));
    },
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

    // Verify that the logout endpoint was called
    await waitFor(() => expect(server.handledRequests.length).toBe(1));
    expect(server.handledRequests[0].url.href).toBe(
      "https://us-central1-olympiads.cloudfunctions.net/logout",
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
