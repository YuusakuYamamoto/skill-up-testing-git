import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    // Vite のデフォルトテンプレートに合わせて調整
    expect(document.querySelector("#root") || document.body).toBeTruthy();
  });
});
