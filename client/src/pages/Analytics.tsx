import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useFile } from "@/contexts/FileContext";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from "recharts";
import { toast } from "sonner";
import { InsightsPanel } from "@/components/InsightsPanel";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const { selectedFileId } = useFile();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<string>("bar");

  const calculateStatsMutation = trpc.analysis.calculateStatistics.useMutation();
  const generateInsightsMutation = trpc.insights.generateInsights.useMutation();

  const handleGenerateInsights = () => {
    if (!selectedFileId) return;
    setInsightsLoading(true);
    setInsightsError(null);
    generateInsightsMutation.mutate(
      { fileId: selectedFileId },
      {
        onSuccess: (data) => {
          setInsights(data.insights);
          setInsightsLoading(false);
          toast.success("Insights gerados com sucesso!");
        },
        onError: (error) => {
          setInsightsLoading(false);
          setInsightsError((error as any).message || "Erro ao gerar insights");
          toast.error(`Erro ao gerar insights: ${(error as any).message}`);
        },
      }
    );
  };

  useEffect(() => {
    if (selectedFileId) {
      setIsLoading(true);
      calculateStatsMutation.mutate(
        { fileId: selectedFileId },
        {
          onSuccess: (data) => {
            setStats(data);
            setIsLoading(false);
            toast.success("Estatísticas calculadas com sucesso!");
            // Gerar insights automaticamente
            setInsightsLoading(true);
            setInsightsError(null);
            generateInsightsMutation.mutate(
              { fileId: selectedFileId },
              {
                onSuccess: (insightsData) => {
                  setInsights(insightsData.insights);
                  setInsightsLoading(false);
                },
                onError: (error) => {
                  setInsightsLoading(false);
                  setInsightsError((error as any).message || "Erro ao gerar insights");
                },
              }
            );
          },
          onError: (error) => {
            setIsLoading(false);
            toast.error(`Erro ao calcular estatísticas: ${(error as any).message}`);
          },
        }
      );
    }
  }, [selectedFileId]);

  if (!selectedFileId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análises e Estatísticas</CardTitle>
            <CardDescription>Visualize análises detalhadas dos seus dados</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Carregue um ficheiro primeiro para visualizar as análises</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Calculando estatísticas...</p>
        </div>
      </div>
    );
  }

  // Preparar dados para gráficos
  const numericColumns = stats?.statistics
    ? Object.entries(stats.statistics)
        .filter(([_, col]: any) => col.mean !== undefined)
        .map(([name, col]: any) => ({
          name,
          mean: col.mean,
          median: col.median,
          stdDev: col.stdDev,
          min: col.min,
          max: col.max,
        }))
    : [];

  const anomaliesData = stats?.anomalies || [];

  return (
    <div className="space-y-6">
      {/* Painel de Insights */}
      {insights && (
        <InsightsPanel insights={insights} isLoading={insightsLoading} error={insightsError} onRefresh={handleGenerateInsights} />
      )}

      {/* Botões de Ação */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Análise</CardTitle>
          <CardDescription>Gere insights automáticos e personalize as análises</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              variant="default"
            >
              {insightsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Insights...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Gerar Insights com IA
                </>
              )}
            </Button>
            <Button variant="outline" disabled>
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparar Ficheiros (em breve)
            </Button>
            <Button variant="outline" disabled>
              <PieChartIcon className="w-4 h-4 mr-2" />
              Exportar Relatório (em breve)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Numéricas */}
      {numericColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Descritivas</CardTitle>
            <CardDescription>Resumo das colunas numéricas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {numericColumns.map((col: any) => (
                <div key={col.name} className="border rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm">{col.name}</p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>Média: <span className="font-semibold">{col.mean.toFixed(2)}</span></div>
                    <div>Mediana: <span className="font-semibold">{col.median.toFixed(2)}</span></div>
                    <div>Desvio Padrão: <span className="font-semibold">{col.stdDev.toFixed(2)}</span></div>
                    <div>Mín: <span className="font-semibold">{col.min}</span></div>
                    <div>Máx: <span className="font-semibold">{col.max}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      {numericColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualizações de Dados</CardTitle>
            <CardDescription>Diferentes perspectivas dos seus dados</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedChart} onValueChange={setSelectedChart}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="bar">Barras</TabsTrigger>
                <TabsTrigger value="line">Linha</TabsTrigger>
                <TabsTrigger value="pie">Pizza</TabsTrigger>
                <TabsTrigger value="scatter">Dispersão</TabsTrigger>
              </TabsList>

              <TabsContent value="bar" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={numericColumns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mean" fill="#3b82f6" name="Média" />
                    <Bar dataKey="median" fill="#10b981" name="Mediana" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="line" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={numericColumns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mean" stroke="#3b82f6" name="Média" />
                    <Line type="monotone" dataKey="median" stroke="#10b981" name="Mediana" />
                    <Line type="monotone" dataKey="stdDev" stroke="#f59e0b" name="Desvio Padrão" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="pie" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={numericColumns}
                      dataKey="mean"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {numericColumns.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="scatter" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="min" name="Mínimo" />
                    <YAxis type="number" dataKey="max" name="Máximo" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Distribuição" data={numericColumns} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Anomalias */}
      {anomaliesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anomalias Detectadas</CardTitle>
            <CardDescription>Valores atípicos encontrados nos dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomaliesData.map((anomaly: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4">
                  <p className="font-semibold text-sm mb-2">{anomaly.columnName}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {anomaly.anomalies.length} anomalia(s) detectada(s)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {anomaly.anomalies.slice(0, 5).map((val: number, i: number) => (
                      <span key={i} className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                        {val}
                      </span>
                    ))}
                    {anomaly.anomalies.length > 5 && (
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                        +{anomaly.anomalies.length - 5} mais
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
