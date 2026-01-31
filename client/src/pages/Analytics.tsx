import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análises e Estatísticas</CardTitle>
          <CardDescription>
            Visualize estatísticas descritivas e gráficos interativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Carregue um ficheiro primeiro para gerar análises
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
