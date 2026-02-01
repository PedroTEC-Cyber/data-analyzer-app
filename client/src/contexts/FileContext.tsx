import React, { createContext, useContext, useState } from "react";

interface FileContextType {
  selectedFileId: number | null;
  setSelectedFileId: (id: number | null) => void;
  lastUploadedFileId: number | null;
  setLastUploadedFileId: (id: number | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [lastUploadedFileId, setLastUploadedFileId] = useState<number | null>(null);

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
