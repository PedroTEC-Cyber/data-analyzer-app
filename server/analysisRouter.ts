import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut, storageGet } from "./storage";
import {
  createUploadedFile,
  getUploadedFilesByUserId,
  getUploadedFileById,
  createAnalysis,
  getAnalysesByFileId,
  createStatistics,
  getStatisticsByAnalysisId,
  updateAnalysisInsights,
} from "./db";
import {
  processCSV,
  processExcel,
  calculateNumericStatistics,
  calculateStringStatistics,
  detectAnomalies,
} from "./dataProcessor";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const analysisRouter = router({
  listFiles: protectedProcedure.query(async ({ ctx }) => {
    const files = await getUploadedFilesByUserId(ctx.user.id);
    return files.map((file) => ({
      ...file,
      columnNames: JSON.parse(file.columnNames),
      columnTypes: JSON.parse(file.columnTypes),
    }));
  }),

  getFile: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const file = await getUploadedFileById(input.fileId);
      if (!file) throw new Error("File not found");

      return {
        ...file,
        columnNames: JSON.parse(file.columnNames),
        columnTypes: JSON.parse(file.columnTypes),
      };
    }),

  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.enum(["csv", "xlsx"]),
        fileBuffer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileBuffer, "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 10MB limit");
      }

      let processedData;
      try {
        if (input.fileType === "csv") {
          processedData = processCSV(buffer.toString("utf-8"));
        } else {
          processedData = processExcel(buffer);
        }
      } catch (error) {
        throw new Error(
          `Failed to process file: ${(error as Error).message}`
        );
      }

      if (processedData.rowCount === 0) {
        throw new Error("File contains no data");
      }

      const fileKey = `uploads/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(
        fileKey,
        buffer,
        "application/octet-stream"
      );

      const uploadedFile = await createUploadedFile({
        userId: ctx.user.id,
        fileName: input.fileName,
        fileKey,
        fileSize: buffer.length,
        fileType: input.fileType,
        rowCount: processedData.rowCount,
        columnCount: processedData.columnCount,
        columnNames: JSON.stringify(
          processedData.columns.map((c) => c.name)
        ),
        columnTypes: JSON.stringify(
          Object.fromEntries(
            processedData.columns.map((c) => [c.name, c.type])
          )
        ),
      });

      const fileId = (uploadedFile as any).insertId as number;
      return {
        fileId: fileId,
        fileName: input.fileName,
        rowCount: processedData.rowCount,
        columnCount: processedData.columnCount,
        columns: processedData.columns,
      };
    }),

  getFileData: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        page: z.number().default(1),
        pageSize: z.number().default(50),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
        filters: z.record(z.string(), z.array(z.string())).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const file = await getUploadedFileById(input.fileId);
      if (!file) throw new Error("File not found");

      const { url } = await storageGet(file.fileKey);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      let processedData;
      if (file.fileType === "csv") {
        processedData = processCSV(Buffer.from(buffer).toString("utf-8"));
      } else {
        processedData = processExcel(Buffer.from(buffer));
      }

      let filteredRows = processedData.rows;
      if (input.filters) {
        for (const [column, values] of Object.entries(input.filters)) {
          filteredRows = filteredRows.filter((row: any) =>
            (values as string[]).includes(String(row[column]))
          );
        }
      }

      if (input.sortBy) {
        filteredRows.sort((a, b) => {
          const aVal = a[input.sortBy!];
          const bVal = b[input.sortBy!];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return input.sortOrder === "asc" ? comparison : -comparison;
        });
      }

      const start = (input.page - 1) * input.pageSize;
      const paginatedRows = filteredRows.slice(
        start,
        start + input.pageSize
      );

      return {
        rows: paginatedRows,
        columns: processedData.columns,
        columnCount: processedData.columnCount,
        totalRows: filteredRows.length,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(filteredRows.length / input.pageSize),
      };
    }),

  calculateStatistics: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const file = await getUploadedFileById(input.fileId);
      if (!file) throw new Error("File not found");

      const { url } = await storageGet(file.fileKey);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      let processedData;
      if (file.fileType === "csv") {
        processedData = processCSV(Buffer.from(buffer).toString("utf-8"));
      } else {
        processedData = processExcel(Buffer.from(buffer));
      }

      const analysis = await createAnalysis({
        userId: ctx.user.id,
        fileId: input.fileId,
        analysisType: "statistics",
        analysisName: `Statistics for ${file.fileName}`,
        analysisData: JSON.stringify({}),
      });

      const analysisId = (analysis as any).insertId as number;
      const statisticsData: any = {};
      const columnTypes = JSON.parse(file.columnTypes);

      for (const column of processedData.columns) {
        const values: any[] = processedData.rows.map((row: any) => row[column.name]);

        if (column.type === "number") {
          const numericValues = (values as any[])
            .map((v) => Number(v))
            .filter((v) => !isNaN(v));
          const stats = calculateNumericStatistics(numericValues);
          const anomalies = detectAnomalies(numericValues);

          statisticsData[column.name] = {
            ...stats,
            anomalies: anomalies.length,
          };

          await createStatistics({
            analysisId: analysisId,
            columnName: column.name,
            columnType: column.type,
            mean: stats.mean?.toString(),
            median: stats.median?.toString(),
            stdDev: stats.stdDev?.toString(),
            min: stats.min?.toString(),
            max: stats.max?.toString(),
            count: stats.count,
            nullCount: values.length - stats.count,
            uniqueCount: new Set(numericValues).size,
          });
        } else {
          const stats = calculateStringStatistics(
            (values as any[]).map((v) => String(v))
          );
          statisticsData[column.name] = stats;

          await createStatistics({
            analysisId: analysisId,
            columnName: column.name,
            columnType: column.type,
            count: stats.count,
            nullCount: stats.nullCount,
            uniqueCount: stats.uniqueCount,
          });
        }
      }

      // Preparar dados de anomalias
      const anomalies: any[] = [];
      for (const column of processedData.columns) {
        if (column.type === "number") {
          const values: any[] = processedData.rows.map((row: any) => row[column.name]);
          const numericValues = (values as any[])
            .map((v) => Number(v))
            .filter((v) => !isNaN(v));
          const anomalyResult = detectAnomalies(numericValues);
          if (anomalyResult.length > 0) {
            anomalies.push({
              columnName: column.name,
              anomalies: anomalyResult,
            });
          }
        }
      }

      return {
        analysisId: analysisId,
        statistics: Object.entries(statisticsData).map(([columnName, stats]: any) => ({
          columnName,
          type: processedData.columns.find((c: any) => c.name === columnName)?.type || "unknown",
          ...stats,
        })),
        anomalies,
      };
    }),

  generateInsights: protectedProcedure
    .input(z.object({ analysisId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return { message: "Insights generation coming soon" };
    }),

  exportData: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        format: z.enum(["csv", "json"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const file = await getUploadedFileById(input.fileId);
      if (!file) throw new Error("File not found");

      const { url } = await storageGet(file.fileKey);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      let processedData;
      if (file.fileType === "csv") {
        processedData = processCSV(Buffer.from(buffer).toString("utf-8"));
      } else {
        processedData = processExcel(Buffer.from(buffer));
      }

      if (input.format === "json") {
        return {
          format: "json",
          data: processedData.rows,
          fileName: `${file.fileName.split(".")[0]}.json`,
        };
      } else {
        const headers = processedData.columns
          .map((c) => c.name)
          .join(",");
        const rows = processedData.rows.map((row) =>
          processedData.columns
            .map((c) => {
              const value = row[c.name];
              return typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value;
            })
            .join(",")
        );
        const csv = [headers, ...rows].join("\n");

        return {
          format: "csv",
          data: csv,
          fileName: `${file.fileName.split(".")[0]}.csv`,
        };
      }
    }),
});
