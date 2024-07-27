import { render, screen } from "@testing-library/react";
import App from "./App";

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
}

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn(() => jest.fn()),
  },
}));

test("renders GrindOlympiads header", () => {
  render(<App />);
  const headerElement = screen.getByText(/GrindOlympiads/i);
  expect(headerElement).toBeInTheDocument();
});
