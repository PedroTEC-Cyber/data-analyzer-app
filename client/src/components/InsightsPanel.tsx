import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lightbulb, RefreshCw, AlertCircle } from "lucide-react";
import { Streamdown } from "streamdown";

interface InsightsPanelProps {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
  fileName?: string;
  onRefresh: () => void;
}

export function InsightsPanel({
  insights,
  isLoading,
  error,
  fileName,
  onRefresh,
}: InsightsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights com IA
          </CardTitle>
          <CardDescription>Analisando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Gerando insights com IA...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={onRefresh} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights com IA
          </CardTitle>
          <CardDescription>Análise inteligente dos seus dados</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Nenhum insight gerado ainda</AlertDescription>
          </Alert>
          <Button onClick={onRefresh} className="mt-4">
            <Lightbulb className="w-4 h-4 mr-2" />
            Gerar Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Insights com IA
            </CardTitle>
            <CardDescription>
              Análise inteligente de {fileName || "seus dados"}
            </CardDescription>
          </div>
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            title="Regenerar insights"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Streamdown>{insights}</Streamdown>
        </div>
      </CardContent>
    </Card>
  );
}
