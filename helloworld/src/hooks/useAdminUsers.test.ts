import { act, renderHook } from "@testing-library/react";
import useAdminUsers from "./useAdminUsers";

// Mock fetch globally
global.fetch = jest.fn();

describe("useAdminUsers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should fetch users and update state", async () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    const { result } = renderHook(() => useAdminUsers());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.users).toEqual([]);

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.users).toEqual(mockUsers);
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );

    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load users. Please try again later.",
    );
    expect(result.current.users).toEqual([]);
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load users. Please try again later.",
    );
    expect(result.current.users).toEqual([]);
  });

  it("should call the correct GCF endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/admin_users",
    );
  });

  it("should handle empty response from API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.users).toEqual([]);
  });

  it("should allow manual refetch", async () => {
    const mockUsers1 = [
      { id: "1", name: "John Doe", email: "john@example.com" },
    ];
    const mockUsers2 = [
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers2 }),
      });

    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.users).toEqual(mockUsers1);

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.users).toEqual(mockUsers2);
  });
});
