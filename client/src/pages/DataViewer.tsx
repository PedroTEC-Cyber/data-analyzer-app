import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Download, ChevronLeft, ChevronRight, Loader2, Trash2, Filter, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useFile } from "@/contexts/FileContext";
import { toast } from "sonner";

export default function DataViewerPage() {
  const { selectedFileId } = useFile();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState<string>();
  const [filterValue, setFilterValue] = useState("");

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

  const handleExport = (format: "csv" | "json") => {
    if (!selectedFileId) return;
    toast.info("Exportação em desenvolvimento");
  };

  const handleClearNulls = () => {
    toast.info("Funcionalidade de limpeza em desenvolvimento");
  };

  const handleRemoveDuplicates = () => {
    toast.info("Funcionalidade de remoção de duplicatas em desenvolvimento");
  };

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
      <Card>
        <CardHeader>
          <CardTitle>Visualizador de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar dados: {(error as any).message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const filteredRows = data?.rows.filter((row: any) => {
    if (searchTerm) {
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterColumn && filterValue) {
      return String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase());
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Painel de Controlo */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Limpeza e Processamento</CardTitle>
          <CardDescription>Ferramentas para processar e limpar seus dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={handleClearNulls}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover Nulos
            </Button>
            <Button
              onClick={handleRemoveDuplicates}
              variant="outline"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Remover Duplicatas
            </Button>
            <Button
              onClick={() => handleExport("csv")}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={() => handleExport("json")}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Painel de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Procure e filtre os dados por coluna</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em todos os dados..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="flex-1"
              />
            </div>
            <Select value={filterColumn || ""} onValueChange={(val) => {
              setFilterColumn(val || undefined);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar coluna..." />
              </SelectTrigger>
              <SelectContent>
                {data?.columns.map((col: any) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterColumn && (
              <Input
                placeholder={`Filtrar por ${filterColumn}...`}
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setPage(1);
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados ({filteredRows.length} registos)</CardTitle>
          <CardDescription>Visualize e explore os dados do seu ficheiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {data?.columns.map((col: any) => (
                    <th
                      key={col.name}
                      className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted"
                      onClick={() => {
                        if (sortBy === col.name) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy(col.name);
                          setSortOrder("asc");
                        }
                      }}
                    >
                      {col.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({col.type})
                      </span>
                      {sortBy === col.name && (
                        <span className="ml-2">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice((page - 1) * pageSize, page * pageSize).map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    {data?.columns.map((col: any) => (
                      <td key={col.name} className="py-3 px-4">
                        <span className="text-muted-foreground">
                          {row[col.name] === null || row[col.name] === undefined
                            ? "—"
                            : String(row[col.name]).substring(0, 50)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Página {page} de {Math.ceil(filteredRows.length / pageSize)}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setPage(Math.min(Math.ceil(filteredRows.length / pageSize), page + 1))}
                disabled={page >= Math.ceil(filteredRows.length / pageSize)}
                variant="outline"
                size="sm"
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
