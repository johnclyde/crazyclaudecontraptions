import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
}));

test("renders GrindOlympiads header", () => {
  render(<App />);
  const headerElement = screen.getByText(/GrindOlympiads/i);
  expect(headerElement).toBeInTheDocument();
});
