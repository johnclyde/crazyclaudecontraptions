import { rest } from "msw";

export const handlers = [
  rest.post(
    "https://us-central1-olympiads.cloudfunctions.net/logout",
    (req, res, ctx) => {
      return res(ctx.json({ message: "Logout successful" }));
    },
  ),
];
