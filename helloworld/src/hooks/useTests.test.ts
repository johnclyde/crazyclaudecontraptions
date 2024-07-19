import { renderHook, act } from "@testing-library/react";
import useTests from "./useTests";

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error
const originalConsoleError = console.error;
console.error = jest.fn();

describe("useTests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("should fetch tests and set initial state", async () => {
    const mockTests = [
      { competition: "Math", year: "2023", exam: "Spring" },
      { competition: "Physics", year: "2023", exam: "Fall" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    const { result } = renderHook(() => useTests());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual(mockTests);
    expect(result.current.error).toBe(null);
    expect(result.current.searchTerm).toBe("");
    expect(result.current.selectedCompetition).toBe("All");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );

    const { result } = renderHook(() => useTests());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load tests. Please try refreshing the page.",
    );
    expect(result.current.tests).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching tests:",
      expect.any(Error),
    );
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { result } = renderHook(() => useTests());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load tests. Please try refreshing the page.",
    );
    expect(result.current.tests).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching tests:",
      expect.any(Error),
    );
  });

  it("should update searchTerm", async () => {
    const { result } = renderHook(() => useTests());

    await act(async () => {
      result.current.setSearchTerm("Math");
    });

    expect(result.current.searchTerm).toBe("Math");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should update selectedCompetition", async () => {
    const { result } = renderHook(() => useTests());

    await act(async () => {
      result.current.setSelectedCompetition("Physics");
    });

    expect(result.current.selectedCompetition).toBe("Physics");
  });

  it("should filter tests based on searchTerm and selectedCompetition", async () => {
    const mockTests = [
      { competition: "Math", year: "2023", exam: "Spring" },
      { competition: "Physics", year: "2023", exam: "Fall" },
      { competition: "Math", year: "2022", exam: "Fall" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    const { result } = renderHook(() => useTests());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));

      result.current.setSearchTerm("fall");
      result.current.setSelectedCompetition("Math");
    });

    expect(result.current.filteredTests).toEqual([
      { competition: "Math", year: "2022", exam: "Fall" },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should call the correct GCF endpoint", async () => {
    const mockTests = [{ competition: "Math", year: "2023", exam: "Spring" }];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    renderHook(() => useTests());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/exams");
  });

  it("should handle empty response from API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useTests());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(console.error).not.toHaveBeenCalled();
  });
});
