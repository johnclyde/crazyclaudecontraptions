import { renderHook, act } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import useUserData from "./useUserData";
import { auth } from "../firebase";
import { User } from "../types";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
  },
}));

describe("useUserData", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return jest.fn(); // This is the unsubscribe function
    });
    global.fetch = jest.fn();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useUserData());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.userProgress).toEqual([]);
    expect(result.current.isAdminMode).toBe(false);
  });

  it("should set isAdminMode to false when admin logs in", async () => {
    const mockUser: User = {
      id: "admin123",
      name: "Admin User",
      email: "admin@example.com",
      avatar: "",
      isAdmin: true,
      isStaff: true,
      createdAt: "2023-01-01",
      lastLogin: "2023-05-01",
      points: 100,
      role: "Admin",
      progress: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback({
        uid: "admin123",
        getIdToken: () => Promise.resolve("fake-token"),
      });
      return jest.fn();
    });

    const { result, waitForNextUpdate } = renderHook(() => useUserData());

    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAdminMode).toBe(false);
  });

  it("should toggle admin mode only for admin users", async () => {
    const { result } = renderHook(() => useUserData());

    await act(async () => {
      result.current.toggleAdminMode();
    });

    expect(result.current.isAdminMode).toBe(false);

    await act(async () => {
      result.current.setIsLoggedIn(true);
      result.current.user = { ...result.current.user, isAdmin: true } as User;
    });

    await act(async () => {
      result.current.toggleAdminMode();
    });

    expect(result.current.isAdminMode).toBe(true);

    await act(async () => {
      result.current.toggleAdminMode();
    });

    expect(result.current.isAdminMode).toBe(false);
  });

  it("should clear user data on logout", async () => {
    const mockUser: User = {
      id: "user123",
      name: "Test User",
      email: "test@example.com",
      avatar: "",
      isAdmin: false,
      isStaff: false,
      createdAt: "2023-01-01",
      lastLogin: "2023-05-01",
      points: 50,
      role: "User",
      progress: [],
    };

    const { result } = renderHook(() => useUserData());

    await act(async () => {
      result.current.setIsLoggedIn(true);
      result.current.user = mockUser;
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.userProgress).toEqual([]);
    expect(result.current.isAdminMode).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
