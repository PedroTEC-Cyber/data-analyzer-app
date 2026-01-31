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
 * Processa ficheiro CSV
 */
export function processCSV(content: string): ProcessedData {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
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
 * Calcula estatísticas descritivas para uma coluna numérica
 */
export function calculateNumericStatistics(values: number[]) {
  const sortedValues = values.filter(v => !isNaN(v)).sort((a, b) => a - b);
  
  if (sortedValues.length === 0) {
    return {
      mean: null,
      median: null,
      stdDev: null,
      min: null,
      max: null,
      count: 0,
    };
  }
  
  const sum = sortedValues.reduce((a, b) => a + b, 0);
  const mean = sum / sortedValues.length;
  
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];
  
  const variance = sortedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sortedValues.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    min: sortedValues[0],
    max: sortedValues[sortedValues.length - 1],
    count: sortedValues.length,
  };
}

/**
 * Calcula estatísticas para uma coluna de string
 */
export function calculateStringStatistics(values: string[]) {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const uniqueValues = new Set(nonNullValues);
  
  return {
    count: nonNullValues.length,
    uniqueCount: uniqueValues.size,
    nullCount: values.length - nonNullValues.length,
  };
}

/**
 * Detecta anomalias em dados numéricos usando IQR (Interquartile Range)
 */
export function detectAnomalies(values: number[]): { anomalies: number[]; threshold: { lower: number; upper: number } } {
  const sortedValues = values.filter(v => !isNaN(v)).sort((a, b) => a - b);
  
  if (sortedValues.length < 4) {
    return { anomalies: [], threshold: { lower: 0, upper: 0 } };
  }
  
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const anomalies = values.filter(v => !isNaN(v) && (v < lowerBound || v > upperBound));
  
  return {
    anomalies,
    threshold: { lower: lowerBound, upper: upperBound },
  };
}
