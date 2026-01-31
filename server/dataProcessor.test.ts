import { describe, it, expect } from "vitest";
import {
  processCSV,
  calculateNumericStatistics,
  calculateStringStatistics,
  detectAnomalies,
} from "./dataProcessor";

describe("Data Processor", () => {
  describe("processCSV", () => {
    it("should parse CSV data correctly", () => {
      const csv = "name,age,salary\nJohn,30,50000\nJane,25,60000";
      const result = processCSV(csv);

      expect(result.rowCount).toBe(2);
      expect(result.columnCount).toBe(3);
      expect(result.columns).toHaveLength(3);
      expect(result.columns[0].name).toBe("name");
      expect(result.rows).toHaveLength(2);
    });

    it("should detect column types correctly", () => {
      const csv = "name,age,salary\nJohn,30,50000\nJane,25,60000";
      const result = processCSV(csv);

      expect(result.columns[0].type).toBe("string");
      expect(result.columns[1].type).toBe("number");
      expect(result.columns[2].type).toBe("number");
    });

    it("should handle empty CSV", () => {
      const csv = "";
      const result = processCSV(csv);

      expect(result.rowCount).toBe(0);
      expect(result.columnCount).toBe(0);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe("calculateNumericStatistics", () => {
    it("should calculate statistics for numeric values", () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateNumericStatistics(values);

      expect(stats.mean).toBe(3);
      expect(stats.median).toBe(3);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
      expect(stats.count).toBe(5);
    });

    it("should handle empty array", () => {
      const values: number[] = [];
      const stats = calculateNumericStatistics(values);

      expect(stats.mean).toBeNull();
      expect(stats.median).toBeNull();
      expect(stats.count).toBe(0);
    });

    it("should calculate standard deviation", () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const stats = calculateNumericStatistics(values);

      expect(stats.stdDev).toBeCloseTo(2, 0);
    });
  });

  describe("calculateStringStatistics", () => {
    it("should calculate string statistics", () => {
      const values = ["apple", "banana", "apple", "cherry", null, undefined, ""];
      const stats = calculateStringStatistics(values);

      expect(stats.count).toBe(4);
      expect(stats.uniqueCount).toBe(3);
      expect(stats.nullCount).toBe(3);
    });

    it("should handle empty array", () => {
      const values: string[] = [];
      const stats = calculateStringStatistics(values);

      expect(stats.count).toBe(0);
      expect(stats.uniqueCount).toBe(0);
      expect(stats.nullCount).toBe(0);
    });
  });

  describe("detectAnomalies", () => {
    it("should detect outliers using IQR method", () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];
      const result = detectAnomalies(values);

      expect(result.anomalies).toContain(100);
      expect(result.anomalies.length).toBeGreaterThan(0);
    });

    it("should return empty anomalies for normal distribution", () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = detectAnomalies(values);

      expect(result.anomalies.length).toBe(0);
    });

    it("should handle small arrays", () => {
      const values = [1, 2, 3];
      const result = detectAnomalies(values);

      expect(result.anomalies).toEqual([]);
      expect(result.threshold.lower).toBe(0);
      expect(result.threshold.upper).toBe(0);
    });
  });
});
