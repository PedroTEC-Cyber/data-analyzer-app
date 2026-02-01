import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useFile } from "@/contexts/FileContext";
import { Loader2 } from "lucide-react";

export default function DataViewerPage() {
  const { selectedFileId } = useFile();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading, error } = trpc.analysis.getFileData.useQuery(
    {
      fileId: selectedFileId || 0,
      page,
      pageSize,
      sortBy,
      sortOrder,
    },
    {
      enabled: !!selectedFileId,
    }
  );

  if (!selectedFileId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Visualizador de Dados</CardTitle>
            <CardDescription>Visualize e explore os dados do seu ficheiro</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Carregue um ficheiro primeiro para visualizar os dados</AlertDescription>
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
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          Erro ao carregar dados: {error.message || "Erro desconhecido"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nenhum dado disponível</AlertDescription>
      </Alert>
    );
  }

  const totalPages = Math.ceil(data.totalRows / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visualizador de Dados</CardTitle>
              <CardDescription>
                {data.totalRows} linhas • {data.columnCount} colunas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  {data.columns.map((col) => (
                    <th
                      key={col.name}
                      className="px-4 py-2 text-left font-semibold text-foreground cursor-pointer hover:bg-muted/80"
                      onClick={() => {
                        if (sortBy === col.name) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy(col.name);
                          setSortOrder("asc");
                        }
                        setPage(1);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {col.name}
                        <span className="text-xs text-muted-foreground">({col.type})</span>
                        {sortBy === col.name && (
                          <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    {data.columns.map((col) => (
                      <td key={col.name} className="px-4 py-2 text-foreground">
                        {String(row[col.name] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={!hasNextPage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
