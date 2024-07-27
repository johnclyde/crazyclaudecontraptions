import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ExamComponent from "./ExamComponent";
import { UserDataProvider } from "../contexts/UserDataContext";

// Mock the UserDataContext
jest.mock("../contexts/UserDataContext", () => ({
  ...jest.requireActual("../contexts/UserDataContext"),
  useUserDataContext: () => ({
    user: { isAdmin: true },
    isAdminMode: false,
    toggleAdminMode: jest.fn(),
  }),
}));

// Mock the API calls
jest.mock("../firebase", () => ({
  getIdToken: jest.fn().mockResolvedValue("mocked-token"),
}));

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        problems: [{ id: "1", number: 1, problem: "Test problem" }],
        comment: "Test comment",
        examId: "test-exam-id",
      }),
  }),
);

describe("ExamComponent", () => {
  const renderExamComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/competition/Math/2023/Spring"]}>
        <UserDataProvider>
          <Routes>
            <Route
              path="/competition/:competition/:year/:exam"
              element={<ExamComponent />}
            />
          </Routes>
        </UserDataProvider>
      </MemoryRouter>,
    );
  };

  it("does not show Edit Problem button after enabling admin mode", async () => {
    renderExamComponent();

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Math - 2023 - Spring")).toBeInTheDocument();
    });

    // Verify that the Edit Problem button is not visible initially
    expect(screen.queryByText("Edit Problem")).not.toBeInTheDocument();

    // Mock the toggleAdminMode function
    const toggleAdminMode = jest.fn().mockImplementation(() => {
      (useUserDataContext as jest.Mock).mockImplementation(() => ({
        user: { isAdmin: true },
        isAdminMode: true,
        toggleAdminMode,
      }));
    });

    // Find and click the "Enable Admin Mode" button
    const adminModeButton = screen.getByText("Enable Admin Mode");
    fireEvent.click(adminModeButton);

    // Verify that toggleAdminMode was called
    expect(toggleAdminMode).toHaveBeenCalled();

    // Verify that the Edit Problem button is still not visible
    expect(screen.queryByText("Edit Problem")).not.toBeInTheDocument();
  });
});
