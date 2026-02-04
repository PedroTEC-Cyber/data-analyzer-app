import React, { createContext, useContext, useState, useEffect } from "react";

interface FileContextType {
  selectedFileId: number | null;
  setSelectedFileId: (id: number | null) => void;
  lastUploadedFileId: number | null;
  setLastUploadedFileId: (id: number | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedFileId");
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  const [lastUploadedFileId, setLastUploadedFileId] = useState<number | null>(null);

  // Sincronizar selectedFileId com localStorage
  useEffect(() => {
    if (selectedFileId !== null) {
      localStorage.setItem("selectedFileId", selectedFileId.toString());
    } else {
      localStorage.removeItem("selectedFileId");
    }
  }, [selectedFileId]);

  // Quando um novo ficheiro é carregado, atualizar selectedFileId automaticamente
  useEffect(() => {
    if (lastUploadedFileId !== null) {
      setSelectedFileId(lastUploadedFileId);
    }
  }, [lastUploadedFileId]);

  return (
    <FileContext.Provider
      value={{
        selectedFileId,
        setSelectedFileId,
        lastUploadedFileId,
        setLastUploadedFileId,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile deve ser usado dentro de FileProvider");
  }
  return context;
}
