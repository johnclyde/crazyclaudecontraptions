import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
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
        screen.getByText("Failed to load exam data. Please try again later."),
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

  it("does not show Edit Problem button after enabling admin mode", async () => {
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

    // Verify that the Edit Problem button is not visible initially
    expect(screen.queryByText("Edit Problem")).not.toBeInTheDocument();

    // Toggle admin mode
    await act(async () => {
      (UserDataContext.useUserDataContext as jest.Mock).mockReturnValue({
        ...mockUserData,
        isAdminMode: true,
      });
      renderExamComponent();
    });

    // Verify that the Edit Problem button is still not visible
    expect(screen.queryByText("Edit Problem")).not.toBeInTheDocument();
  });
});
