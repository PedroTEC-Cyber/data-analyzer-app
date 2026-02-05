import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Trash2, RotateCcw, Calendar, FileText, Database } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useFile } from "@/contexts/FileContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const { setSelectedFileId } = useFile();
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  
  const { data: files, isLoading, error, refetch } = trpc.analysis.listFiles.useQuery();
  const deleteFileMutation = trpc.analysis.deleteFile.useMutation();

  const handleReuseFile = (fileId: number) => {
    setSelectedFileId(fileId);
    toast.success("Ficheiro selecionado! Navegue para Visualizador ou Análises");
  };

  const handleDeleteFile = async (fileId: number) => {
    deleteFileMutation.mutate(
      { fileId },
      {
        onSuccess: () => {
          toast.success("Ficheiro eliminado com sucesso");
          setFileToDelete(null);
          refetch();
        },
        onError: (error: any) => {
          toast.error(`Erro ao eliminar ficheiro: ${error.message}`);
        },
      }
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ficheiros</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar histórico: {(error as any).message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ficheiros</CardTitle>
          <CardDescription>Ficheiros que carregou anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Nenhum ficheiro carregado ainda. Comece por fazer upload de um ficheiro na aba Upload.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ficheiros</CardTitle>
          <CardDescription>Gerencie e reutilize ficheiros carregados anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {files.map((file: any) => (
              <div
                key={file.id}
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Nome do Ficheiro */}
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">{file.fileType.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Data de Carregamento */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Data</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Tamanho do Ficheiro */}
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Tamanho</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>

                  {/* Metadados */}
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Dados</p>
                      <p className="text-xs text-muted-foreground">
                        {file.rowCount} linhas × {file.columnCount} colunas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Colunas */}
                <div className="mb-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Colunas:</p>
                  <div className="flex flex-wrap gap-2">
                    {file.columnNames.map((col: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
                      >
                        {col}
                        <span className="text-muted-foreground">
                          ({file.columnTypes[col] || "unknown"})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleReuseFile(file.id)}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reutilizar
                  </Button>
                  <Button
                    onClick={() => setFileToDelete(file.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Eliminação */}
      <AlertDialog open={fileToDelete !== null} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Ficheiro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar este ficheiro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
