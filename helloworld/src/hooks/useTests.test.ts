import { renderHook, act } from "@testing-library/react-hooks";
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

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual(mockTests);
    expect(result.current.error).toBe(null);
    expect(result.current.searchTerm).toBe("");
    expect(result.current.selectedCompetition).toBe("All");
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load tests. Please try refreshing the page.",
    );
    expect(result.current.tests).toEqual([]);
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to load tests. Please try refreshing the page.",
    );
    expect(result.current.tests).toEqual([]);
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

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    await act(async() => {
      await waitForNextUpdate();
    });
    
    await act(async() => {
      result.current.setSearchTerm("fall");
      result.current.setSelectedCompetition("Math");
    });

    expect(result.current.filteredTests).toEqual([
      { competition: "Math", year: "2022", exam: "Fall" },
    ]);
  });

  it("should call the correct GCF endpoint", async () => {
    const mockTests = [{ competition: "Math", year: "2023", exam: "Spring" }];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    renderHook(() => useTests());

    expect(global.fetch).toHaveBeenCalledWith(
      "https://us-central1-olympiads.cloudfunctions.net/exams",
    );
  });

  it("should handle empty response from API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    await act(async() => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe(null);
  });
});
