import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'unknown';
}

export interface ProcessedData {
  rows: DataRow[];
  columns: ColumnInfo[];
  rowCount: number;
  columnCount: number;
}

/**
 * Detecta o tipo de dado de uma coluna analisando seus valores
 */
function detectColumnType(values: any[]): ColumnInfo['type'] {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'unknown';
  
  const numberCount = nonNullValues.filter(v => !isNaN(Number(v))).length;
  const dateCount = nonNullValues.filter(v => !isNaN(Date.parse(String(v)))).length;
  const booleanCount = nonNullValues.filter(v => ['true', 'false', '1', '0'].includes(String(v).toLowerCase())).length;
  
  if (numberCount / nonNullValues.length > 0.8) return 'number';
  if (booleanCount / nonNullValues.length > 0.8) return 'boolean';
  if (dateCount / nonNullValues.length > 0.8) return 'date';
  
  return 'string';
}

/**
 * Detecta o delimitador do CSV (vírgula, ponto-e-vírgula, tab, etc)
 */
function detectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0];
  const delimiters = [',', ';', '\t', '|'];
  
  let maxCount = 0;
  let detectedDelimiter = ',';
  
  for (const delimiter of delimiters) {
    const regex = new RegExp('\\' + delimiter, 'g');
    const count = (firstLine.match(regex) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = delimiter;
    }
  }
  
  return detectedDelimiter;
}

/**
 * Processa ficheiro CSV
 */
export function processCSV(content: string): ProcessedData {
  const delimiter = detectDelimiter(content);
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: delimiter,
  }) as DataRow[];
  
  if (rows.length === 0) {
    return { rows: [], columns: [], rowCount: 0, columnCount: 0 };
  }
  
  const columnNames = Object.keys(rows[0]);
  const columns: ColumnInfo[] = columnNames.map(name => {
    const values = rows.map(row => row[name]);
    return {
      name,
      type: detectColumnType(values),
    };
  });
  
  return {
    rows,
    columns,
    rowCount: rows.length,
    columnCount: columns.length,
  };
}

/**
 * Processa ficheiro Excel
 */
export function processExcel(buffer: Buffer): ProcessedData {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rows = XLSX.utils.sheet_to_json(worksheet) as DataRow[];
  
  if (rows.length === 0) {
    return { rows: [], columns: [], rowCount: 0, columnCount: 0 };
  }
  
  const columnNames = Object.keys(rows[0]);
  const columns: ColumnInfo[] = columnNames.map(name => {
    const values = rows.map(row => row[name]);
    return {
      name,
      type: detectColumnType(values),
    };
  });
  
  return {
    rows,
    columns,
    rowCount: rows.length,
    columnCount: columns.length,
  };
}

/**
 * Calcula estatísticas para valores numéricos
 */
export function calculateNumericStatistics(values: number[]): any {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const median = values.length % 2 === 0
    ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
    : sorted[Math.floor(values.length / 2)];
  
  return {
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

/**
 * Calcula estatísticas para valores de texto
 */
export function calculateStringStatistics(values: string[]): any {
  const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined));
  const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
  
  return {
    uniqueCount: uniqueValues.size,
    nullCount,
    count: values.length,
    mostCommon: Array.from(uniqueValues)[0] || null,
  };
}

/**
 * Detecta anomalias usando o método IQR (Interquartile Range)
 */
export function detectAnomalies(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(v => v < lowerBound || v > upperBound);
}
