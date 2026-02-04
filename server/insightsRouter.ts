import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut, storageGet } from "./storage";
import {
  getUploadedFileById,
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

export const insightsRouter = router({
  generateInsights: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const file = await getUploadedFileById(input.fileId);
      if (!file) throw new Error("File not found");

      // Obter dados do ficheiro
      const { url } = await storageGet(file.fileKey);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      let processedData;
      if (file.fileType === "csv") {
        processedData = processCSV(Buffer.from(buffer).toString("utf-8"));
      } else {
        processedData = processExcel(Buffer.from(buffer));
      }

      // Calcular estatísticas para contexto da IA
      const stats: any = {};
      for (const column of processedData.columns) {
        const values: any[] = processedData.rows.map((row: any) => row[column.name]);
        if (column.type === "number") {
          const numericValues = (values as any[])
            .map((v) => Number(v))
            .filter((v) => !isNaN(v));
          stats[column.name] = calculateNumericStatistics(numericValues);
          stats[column.name].anomalies = detectAnomalies(numericValues);
        } else {
          stats[column.name] = calculateStringStatistics(
            (values as any[]).map((v) => String(v))
          );
        }
      }

      // Preparar prompt para IA
      const statsJson = JSON.stringify(stats, null, 2);
      const columnNames = processedData.columns.map((c: any) => c.name).join(", ");
      
      const prompt = `Analise os seguintes dados estatísticos de um ficheiro de dados e forneça insights profissionais, recomendações e sugestões de visualizações.

Estatísticas dos Dados:
${statsJson}

Número de linhas: ${processedData.rows.length}
Colunas: ${columnNames}

Forneça uma análise estruturada com:
1. Resumo executivo dos dados
2. Padrões e tendências identificadas
3. Anomalias ou valores atípicos
4. Recomendações de visualizações mais adequadas
5. Sugestões para análises adicionais
6. Possíveis correlações entre variáveis`;

      // Invocar LLM para gerar insights
      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um analista de dados especializado. Forneça insights profissionais, claros e acionáveis sobre dados estatísticos.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const insights = llmResponse.choices[0]?.message?.content || "";

      // Notificar proprietário sobre análise concluída
      await notifyOwner({
        title: "Análise de Dados Concluída",
        content: `Análise do ficheiro "${file.fileName}" foi concluída com sucesso. ${processedData.rows.length} linhas processadas.`,
      });

      return {
        insights,
        fileName: file.fileName,
        rowCount: processedData.rows.length,
        columnCount: processedData.columns.length,
        generatedAt: new Date().toISOString(),
      };
    }),
});
