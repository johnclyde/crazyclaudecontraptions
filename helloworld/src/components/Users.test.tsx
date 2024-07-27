import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import * as firebase from "../firebase";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("Users component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render loading state initially", async () => {
    (firebase.getIdToken as jest.Mock).mockResolvedValue("mock-token");
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Users isAdminMode={false} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display users", async () => {
    (firebase.getIdToken as jest.Mock).mockResolvedValue("mock-token");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          users: [
            {
              id: "1",
              name: "John Doe",
              email: "john@example.com",
              status: "user",
            },
            {
              id: "2",
              name: "Jane Doe",
              email: "jane@example.com",
              status: "admin",
            },
          ],
        }),
    });

    render(<Users isAdminMode={false} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should handle empty response from API", async () => {
    (firebase.getIdToken as jest.Mock).mockResolvedValue("mock-token");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    });

    render(<Users isAdminMode={false} />);

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should handle error when fetching users", async () => {
    (firebase.getIdToken as jest.Mock).mockResolvedValue("mock-token");
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API error"));

    render(<Users isAdminMode={false} />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load users. Please try again later."),
      ).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
});
