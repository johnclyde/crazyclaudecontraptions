import { render, screen } from "@testing-library/react";
import App from "./App";

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
