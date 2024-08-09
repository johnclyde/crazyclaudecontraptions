import React from "react";
import { render, act, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import * as UserDataContext from "../contexts/UserDataContext";
import { MemoryRouter } from "react-router-dom";
import { User } from "../types";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser: User = {
  id: "1",
  isAdmin: true,
  isStaff: true,
  name: "Frank Drebbin",
  email: "mrdrebbin@example.com",
  avatar: "",
  createdAt: "2023-01-01",
  lastLogin: "2023-01-01",
  points: 0,
  role: "User",
  progress: [],
};

describe("Users Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [mockUser] }),
    });
  });

  it("should render loading state initially", async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display users", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Frank Drebbin")).toBeInTheDocument();
      expect(screen.getByText("mrdrebbin@example.com")).toBeInTheDocument();
    });
  });

  it("should handle empty response from API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.queryByText("Frank Drebbin")).not.toBeInTheDocument();
    });
  });

  it("should handle error when fetching users", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API error"));

    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load users. Please try again later."),
      ).toBeInTheDocument();
    });
  });

  it("should not render for non-admin users", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: false },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Users")).not.toBeInTheDocument();
    });
  });

  it("should not render when admin mode is off", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: false,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Users")).not.toBeInTheDocument();
    });
  });

  it("should fetch users when admin user and admin mode are true", async () => {
    jest.spyOn(UserDataContext, "useUserDataContext").mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should re-fetch users when admin status changes", async () => {
    const mockUseContext = jest.spyOn(UserDataContext, "useUserDataContext");
    mockUseContext.mockReturnValue({
      user: { isAdmin: false },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    const { rerender } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });

    mockUseContext.mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    rerender(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should re-fetch users when admin mode changes", async () => {
    const mockUseContext = jest.spyOn(UserDataContext, "useUserDataContext");
    mockUseContext.mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: false,
    } as any);

    const { rerender } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });

    mockUseContext.mockReturnValue({
      user: { isAdmin: true },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    rerender(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should not re-fetch when unrelated user properties change", async () => {
    const mockUseContext = jest.spyOn(UserDataContext, "useUserDataContext");
    mockUseContext.mockReturnValue({
      user: { isAdmin: true, name: "John" },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    const { rerender } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    mockUseContext.mockReturnValue({
      user: { isAdmin: true, name: "Jane" },
      isLoggedIn: true,
      isAdminMode: true,
    } as any);

    rerender(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
