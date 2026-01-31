import { useAuth } from "@/_core/hooks/useAuth";
import Dashboard from "./Dashboard";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Data Analyzer Pro</h1>
            <p className="text-muted-foreground mt-2">
              Análise inteligente de dados com visualizações interativas
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Faça login para começar a analisar seus dados
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
