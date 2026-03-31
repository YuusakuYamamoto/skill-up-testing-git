import { describe, it, expect } from "vitest";
import { AppService } from "../src/app.service";

describe("AppService", () => {
  const service = new AppService();

  describe("getHello", () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe("Hello World!");
    });
  });

  describe("add", () => {
    it("should add two numbers correctly", () => {
      expect(service.add(1, 2)).toBe(3);
    });

    it("should handle negative numbers", () => {
      expect(service.add(-1, -2)).toBe(-3);
    });

    it("should handle zero", () => {
      expect(service.add(0, 0)).toBe(0);
    });
  });
});
