import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

test("renders GrindOlympiads header", () => {
  render(<App />);
  const headerElement = screen.getByText(/GrindOlympiads/i);
  expect(headerElement).toBeInTheDocument();
});
