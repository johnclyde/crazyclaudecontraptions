import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Users from "./Users";

describe("Users Component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("fetches and displays users", async () => {
    const mockUsers = [
      { id: "1", name: "User 1", email: "user1@example.com" },
      { id: "2", name: "User 2", email: "user2@example.com" },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(<Users />);

    // Check for loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "https://us-central1-olympiads.cloudfunctions.net/admin_users",
      );
    });

    // Check if users are displayed
    for (const user of mockUsers) {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    }
  });

  it("handles fetch error", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch users"));

    render(<Users />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load users. Please try again later./i),
      ).toBeInTheDocument();
    });
  });

  it("displays message when no users are found", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText(/No users found/i)).toBeInTheDocument();
    });
  });
});
