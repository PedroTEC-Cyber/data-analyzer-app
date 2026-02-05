import { describe, it, expect } from "vitest";
import {
  processCSV,
  processExcel,
  calculateNumericStatistics,
  calculateStringStatistics,
  detectAnomalies,
} from "./dataProcessor";

describe("Data Processor", () => {
  describe("calculateNumericStatistics", () => {
    it("should calculate statistics correctly", () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateNumericStatistics(values);

      expect(stats.mean).toBe(3);
      expect(stats.median).toBe(3);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
      expect(stats.count).toBe(5);
    });

    it("should handle single value", () => {
      const values = [42];
      const stats = calculateNumericStatistics(values);

      expect(stats.mean).toBe(42);
      expect(stats.median).toBe(42);
      expect(stats.min).toBe(42);
      expect(stats.max).toBe(42);
    });

    it("should calculate standard deviation", () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateNumericStatistics(values);

      expect(stats.stdDev).toBeGreaterThan(0);
    });
  });

  describe("calculateStringStatistics", () => {
    it("should calculate string statistics correctly", () => {
      const values = ["a", "b", "a", "c"];
      const stats = calculateStringStatistics(values);

      expect(stats.uniqueCount).toBe(3);
      expect(stats.count).toBe(4);
      expect(stats.nullCount).toBe(0);
    });

    it("should count null values", () => {
      const values = ["a", "", "b", ""];
      const stats = calculateStringStatistics(values);

      expect(stats.nullCount).toBe(2);
      expect(stats.count).toBe(4);
    });
  });

  describe("detectAnomalies", () => {
    it("should detect anomalies correctly", () => {
      const values = [1, 2, 3, 4, 5, 100];
      const result = detectAnomalies(values);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain(100);
    });

    it("should return empty array for normal distribution", () => {
      const values = [1, 2, 3, 4, 5];
      const result = detectAnomalies(values);

      expect(result.length).toBe(0);
    });

    it("should handle small arrays", () => {
      const values = [1, 2, 3];
      const result = detectAnomalies(values);

      expect(result).toEqual([]);
    });
  });
});
