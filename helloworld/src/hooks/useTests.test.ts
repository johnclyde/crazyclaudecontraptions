import { renderHook } from "@testing-library/react-hooks";
import { act } from "react";
import useTests from "./useTests";

// Mock fetch globally
global.fetch = jest.fn();

describe("useTests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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

    let hook;
    await act(async () => {
      hook = renderHook(() => useTests());
      await hook.waitForNextUpdate();
    });

    expect(hook.result.current.loading).toBe(false);
    expect(hook.result.current.tests).toEqual(mockTests);
    expect(hook.result.current.error).toBe(null);
    expect(hook.result.current.searchTerm).toBe("");
    expect(hook.result.current.selectedCompetition).toBe("All");
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );

    let hook;
    await act(async () => {
      hook = renderHook(() => useTests());
      expect(hook.result.current.loading).toBe(true);
      await hook.waitForNextUpdate();
    });

    expect(hook.result.current.loading).toBe(false);
    expect(hook.result.current.error).toBe(
      "Failed to load tests. Please try refreshing the page.",
    );
    expect(hook.result.current.tests).toEqual([]);
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    let hook;
    await act(async () => {
      hook = renderHook(() => useTests());
      await hook.waitForNextUpdate();
    });

    expect(hook.result.current.loading).toBe(false);
    expect(hook.result.current.error).toBe(
      "Failed to load tests. Please try refreshing the page.",
    );
    expect(hook.result.current.tests).toEqual([]);
  });

  it("should update searchTerm", async () => {
    const { result } = renderHook(() => useTests());

    await act(async () => {
      result.current.setSearchTerm("Math");
    });

    expect(result.current.searchTerm).toBe("Math");
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

    let hook;
    await act(async () => {
      hook = renderHook(() => useTests());
      await hook.waitForNextUpdate();

      hook.result.current.setSearchTerm("fall");
      hook.result.current.setSelectedCompetition("Math");
    });

    expect(hook.result.current.filteredTests).toEqual([
      { competition: "Math", year: "2022", exam: "Fall" },
    ]);
  });

  it("should call the correct GCF endpoint", async () => {
    const mockTests = [{ competition: "Math", year: "2023", exam: "Spring" }];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    await act(async () => {
      renderHook(() => useTests());
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/exams",
    );
  });

  it("should handle empty response from API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    let hook;
    await act(async () => {
      hook = renderHook(() => useTests());
      await hook.waitForNextUpdate();
    });

    expect(hook.result.current.loading).toBe(false);
    expect(hook.result.current.tests).toEqual([]);
    expect(hook.result.current.error).toBe(null);
  });
});
