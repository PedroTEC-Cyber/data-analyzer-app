import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DataViewerPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualizador de Dados</CardTitle>
          <CardDescription>
            Visualize e explore os dados do seu ficheiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Carregue um ficheiro primeiro para visualizar os dados
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
