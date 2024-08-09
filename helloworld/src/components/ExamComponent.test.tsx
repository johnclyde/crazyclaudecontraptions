import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ExamComponent from "./ExamComponent";
import * as UserDataContext from "../contexts/UserDataContext";

jest.mock("../firebase", () => ({
  getIdToken: jest.fn().mockResolvedValue("mocked-token"),
}));

global.fetch = jest.fn();

jest.mock("../contexts/UserDataContext", () => ({
  useUserDataContext: jest.fn(),
}));

describe("ExamComponent", () => {
  const mockUserData = {
    user: { isAdmin: true },
    isLoggedIn: true,
    isAdminMode: false,
    toggleAdminMode: jest.fn(),
  };

  const renderExamComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/competition/Math/2023/Spring"]}>
        <Routes>
          <Route
            path="/competition/:competition/:year/:exam"
            element={<ExamComponent />}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (UserDataContext.useUserDataContext as jest.Mock).mockReturnValue(
      mockUserData,
    );
    // Silence console.error for our tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    (console.error as jest.Mock).mockRestore();
  });

  it("shows loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}),
    );
    await act(async () => {
      renderExamComponent();
    });
    expect(screen.getByText("Loading exam data...")).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );
    await act(async () => {
      renderExamComponent();
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Error: Failed to load exam data. Please try again later.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders exam data when fetch succeeds", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          problems: [{ id: "1", number: 1, problem: "Test problem" }],
          comment: "Test comment",
          examId: "test-exam-id",
        }),
    });
    await act(async () => {
      renderExamComponent();
    });
    await waitFor(() => {
      expect(screen.getByText("Math - 2023 - Spring")).toBeInTheDocument();
      expect(screen.getByText("Test comment")).toBeInTheDocument();
      expect(screen.getByText("Problem 1:")).toBeInTheDocument();
      expect(screen.getByText("Test problem")).toBeInTheDocument();
    });
  });

  it("does not show Edit Problem button when admin mode is disabled", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          problems: [{ id: "1", number: 1, problem: "Test problem" }],
          comment: "Test comment",
          examId: "test-exam-id",
        }),
    });

    await act(async () => {
      renderExamComponent();
    });

    await waitFor(() => {
      expect(screen.getByText("Math - 2023 - Spring")).toBeInTheDocument();
    });

    expect(screen.queryByText("Edit Problem")).not.toBeInTheDocument();
  });

  it("shows Edit Problem button when admin mode is enabled", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          problems: [{ id: "1", number: 1, problem: "Test problem" }],
          comment: "Test comment",
          examId: "test-exam-id",
        }),
    });

    (UserDataContext.useUserDataContext as jest.Mock).mockReturnValue({
      ...mockUserData,
      isAdminMode: true,
    });

    await act(async () => {
      renderExamComponent();
    });

    await waitFor(() => {
      expect(screen.getByText("Math - 2023 - Spring")).toBeInTheDocument();
    });

    expect(screen.getByText("Edit Problem")).toBeInTheDocument();
  });

  it("Edit Problem button appears when enabling admin mode", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          problems: [{ id: "1", number: 1, problem: "Test problem" }],
          comment: "Test comment",
          examId: "test-exam-id",
        }),
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={["/competition/Math/2023/Spring"]}>
        <Routes>
          <Route
            path="/competition/:competition/:year/:exam"
            element={<ExamComponent />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Math - 2023 - Spring")).toBeInTheDocument();
    });

    // Verify that the Edit Problem button is not visible initially
    expect(screen.queryByText("Edit Problem")).not.toBeInTheDocument();

    // Toggle admin mode
    act(() => {
      (UserDataContext.useUserDataContext as jest.Mock).mockReturnValue({
        ...mockUserData,
        isAdminMode: true,
      });
    });

    // Re-render the component
    rerender(
      <MemoryRouter initialEntries={["/competition/Math/2023/Spring"]}>
        <Routes>
          <Route
            path="/competition/:competition/:year/:exam"
            element={<ExamComponent />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for the component to update
    await waitFor(() => {
      expect(screen.queryByText("Edit Problem")).toBeInTheDocument();
    });
  });

  it("toggles between showing one problem and all problems", async () => {
    const mockProblems = [
      { id: "1", number: 1, problem: "Problem 1" },
      { id: "2", number: 2, problem: "Problem 2" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ problems: mockProblems, comment: "Test comment" }),
    });

    render(
      <MemoryRouter initialEntries={["/competition/Math/2023/Spring"]}>
        <Routes>
          <Route
            path="/competition/:competition/:year/:exam"
            element={<ExamComponent />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Problem 1")).toBeInTheDocument();
      expect(screen.queryByText("Problem 2")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Show All Problems"));

    await waitFor(() => {
      expect(screen.getByText("Problem 1")).toBeInTheDocument();
      expect(screen.getByText("Problem 2")).toBeInTheDocument();
    });
  });

  it("navigates through problems correctly", async () => {
    const mockProblems = [
      { id: "1", number: 1, problem: "Problem 1" },
      { id: "2", number: 2, problem: "Problem 2" },
      { id: "3", number: 3, problem: "Problem 3" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ problems: mockProblems, comment: "Test comment" }),
    });

    render(
      <MemoryRouter initialEntries={["/competition/Math/2023/Spring"]}>
        <Routes>
          <Route
            path="/competition/:competition/:year/:exam"
            element={<ExamComponent />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Problem 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Next →"));

    await waitFor(() => {
      expect(screen.getByText("Problem 2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Next →"));

    await waitFor(() => {
      expect(screen.getByText("Problem 3")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("← Previous"));

    await waitFor(() => {
      expect(screen.getByText("Problem 2")).toBeInTheDocument();
    });
  });
});
