import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FileUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.analysis.uploadFile.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast.error("Apenas ficheiros CSV e Excel são suportados");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("O ficheiro não pode exceder 10MB");
      return;
    }

    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const fileType = file.name.endsWith(".xlsx") ? "xlsx" : "csv";

      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: fileType as "csv" | "xlsx",
        fileBuffer: base64,
      });

      toast.success(`Ficheiro ${file.name} carregado com sucesso!`);
      console.log("Upload result:", result);
    } catch (error) {
      toast.error(`Erro ao carregar ficheiro: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Carregar Ficheiro de Dados</CardTitle>
          <CardDescription>
            Carregue um ficheiro CSV ou Excel para começar a análise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-muted-foreground" />
              </div>

              <div>
                <p className="text-lg font-semibold text-foreground">
                  Arraste o ficheiro aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Suportados: CSV, Excel (.xlsx) - Máximo 10MB
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Selecionar Ficheiro
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Os ficheiros são processados de forma segura e armazenados com encriptação. Apenas você pode aceder aos seus dados.
        </AlertDescription>
      </Alert>
    </div>
  );
}
