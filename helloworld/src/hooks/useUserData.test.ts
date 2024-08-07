import { renderHook, act } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import useUserData from "./useUserData";
import { User } from "../types";
import { Auth, UserCredential } from "firebase/auth";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("useUserData", () => {
  const mockNavigate = jest.fn();
  let mockAuth: jest.Mocked<Auth>;
  let mockSignInWithPopup: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    mockAuth = {
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn(),
    } as unknown as jest.Mocked<Auth>;

    mockSignInWithPopup = jest.fn();

    global.fetch = jest.fn();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useUserData(mockAuth, mockSignInWithPopup),
    );

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.userProgress).toEqual([]);
  });

  it("should update user data when admin logs in", async () => {
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

    const mockFirebaseUser = {
      uid: "admin123",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
      emailVerified: false,
      isAnonymous: false,
      metadata: {
        creationTime: null,
        lastSignInTime: null,
      },
      providerData: [],
      refreshToken: "mock-refresh-token",
      tenantId: null,
      delete: jest.fn(),
      getIdTokenResult: jest.fn(),
      reload: jest.fn(),
      toJSON: jest.fn(),
      displayName: null,
      email: null,
      phoneNumber: null,
      photoURL: null,
      providerId: "firebase",
    };

    mockSignInWithPopup.mockResolvedValueOnce({
      user: mockFirebaseUser,
      providerId: "google.com",
      operationType: "signIn",
    } as UserCredential);

    // Mock the login API call
    };

    (auth.signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: mockFirebaseUser,
    });

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/login") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: "Login successful" }),
        });
      } else if (url === "/api/user/profile") {
        return Promise.resolve({
          ok: true,
          json: async () => mockUser,
        });
      }
    });

    (auth.signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: { getIdToken: jest.fn().mockResolvedValue("mock-token") },
    });

    const { result } = renderHook(() =>
      useUserData(mockAuth, mockSignInWithPopup),
    );
    const { result } = renderHook(() => useUserData());

    await act(async () => {
      await result.current.login();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
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

    const { result } = renderHook(() =>
      useUserData(mockAuth, mockSignInWithPopup),
    );

    await act(async () => {
      result.current.setUser(mockUser);
      result.current.setIsLoggedIn(true);
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
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
