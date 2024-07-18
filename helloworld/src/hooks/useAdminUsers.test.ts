import { renderHook, act } from "@testing-library/react-hooks";
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
      { id: "2", name: "Jane Doe", email: "jane@example.com" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useAdminUsers());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );

    const { result, waitForNextUpdate } = renderHook(() => useAdminUsers());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load users. Please try again later.",
    );
    expect(result.current.users).toEqual([]);
  });

  it("should call fetch with correct URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    renderHook(() => useAdminUsers());

    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/admin_users",
    );
  });
});
