import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Users from "./Users";

describe("Users Component", () => {
  it("displays loading state initially", async () => {
    render(<Users />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("fetches and displays users", async () => {
    const mockUsers = [
      { id: "1", name: "User 1", email: "user1@example.com" },
      { id: "2", name: "User 2", email: "user2@example.com" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(<Users />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    for (const user of mockUsers) {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/admin_users",
    );
  });

  it("handles fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch users"),
    );

    render(<Users />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("Failed to load users. Please try again later."),
    ).toBeInTheDocument();
  });

  it("displays message when no users are found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    render(<Users />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });
});
