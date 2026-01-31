import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ficheiros</CardTitle>
          <CardDescription>
            Veja todos os ficheiros que carregou e suas análises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum ficheiro carregado ainda
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
