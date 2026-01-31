import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import FileUploadPage from "./FileUpload";
import DataViewerPage from "./DataViewer";
import AnalyticsPage from "./Analytics";
import HistoryPage from "./History";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Data Analyzer Pro</h1>
          <p className="text-muted-foreground mt-2">
            Análise inteligente de dados com visualizações interativas e insights automáticos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="viewer">Visualizador</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUploadPage />
          </TabsContent>

          <TabsContent value="viewer" className="space-y-4">
            <DataViewerPage />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsPage />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <HistoryPage />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
