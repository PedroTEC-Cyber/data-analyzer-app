import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useFile } from "@/contexts/FileContext";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const { selectedFileId } = useFile();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateStatsMutation = trpc.analysis.calculateStatistics.useMutation();

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
          },
          onError: (error) => {
            setIsLoading(false);
            toast.error(`Erro ao calcular estatísticas: ${error.message}`);
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
            <CardDescription>Visualize estatísticas descritivas e gráficos interativos</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Carregue um ficheiro primeiro para gerar análises</AlertDescription>
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

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análises e Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              if (selectedFileId) {
                setIsLoading(true);
                calculateStatsMutation.mutate({ fileId: selectedFileId });
              }
            }}>
              Calcular Estatísticas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  // Preparar dados para gráficos
  const numericStats = stats.statistics.filter((s: any) => s.type === "number");
  const stringStats = stats.statistics.filter((s: any) => s.type === "string");

  const numericChartData = numericStats.map((stat: any) => ({
    name: stat.columnName,
    média: stat.mean || 0,
    mediana: stat.median || 0,
    mín: stat.min || 0,
    máx: stat.max || 0,
  }));

  const anomalyData = stats.anomalies.map((anom: any, idx: number) => ({
    id: idx,
    coluna: anom.columnName,
    anomalias: anom.anomalies.length,
  }));

  return (
    <div className="space-y-6">
      {/* Estatísticas Numéricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {numericStats.map((stat: any) => (
          <Card key={stat.columnName}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{stat.columnName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Média</p>
                <p className="text-lg font-semibold">{stat.mean?.toFixed(2) || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mediana</p>
                <p className="text-lg font-semibold">{stat.median?.toFixed(2) || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Desvio Padrão</p>
                <p className="text-lg font-semibold">{stat.stdDev?.toFixed(2) || "—"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Estatísticas */}
      {numericChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Estatísticas Numéricas</CardTitle>
            <CardDescription>Média, mediana, mínimo e máximo por coluna</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={numericChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="média" fill="#3b82f6" />
                <Bar dataKey="mediana" fill="#8b5cf6" />
                <Bar dataKey="mín" fill="#10b981" />
                <Bar dataKey="máx" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Anomalias */}
      {anomalyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anomalias Detectadas</CardTitle>
            <CardDescription>Valores atípicos por coluna</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={anomalyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ coluna, anomalias }: any) => `${coluna}: ${anomalias}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="anomalias"
                >
                  {anomalyData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas de Strings */}
      {stringStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Texto</CardTitle>
            <CardDescription>Informações sobre colunas de texto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stringStats.map((stat: any) => (
                <div key={stat.columnName} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">{stat.columnName}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valores únicos:</span>
                      <span className="font-medium">{stat.uniqueCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valores nulos:</span>
                      <span className="font-medium">{stat.nullCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{stat.count || 0}</span>
                    </div>
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
