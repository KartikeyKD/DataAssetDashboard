import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

interface ColumnFilter {
  column: string;
  value: string;
  type: 'text' | 'select';
  options?: string[];
}

const CHUNK_SIZE = 100; // Process 100 rows at a time
const VIRTUAL_ITEM_SIZE = 40; // Height of each row in pixels
const VISIBLE_ROWS = 20; // Number of visible rows at once

export const OptimizedExcelDataTable = () => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(true);
  
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadExcelDataOptimized();
  }, []);

  const loadExcelDataOptimized = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setIsProcessing(true);
      
      // Fetch the Excel file
      const response = await fetch('/Alation_Analytics_Schema_BusinessEntity.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch Excel file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Use chunked parsing for better performance
      await parseExcelWithChunking(arrayBuffer);
      
    } catch (err) {
      console.error('Error loading Excel file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Excel file');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const parseExcelWithChunking = async (arrayBuffer: ArrayBuffer) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Parse Excel file with optimized options
        const workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          cellDates: false,
          cellNF: false,
          cellText: false
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON - this is the main parsing step
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: true,
          defval: ''
        });
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        // Get headers from first row
        const excelHeaders = jsonData[0] as string[];
        setHeaders(excelHeaders);
        
        // Process data in chunks
        const dataRows = jsonData.slice(1) as any[][];
        const totalRows = dataRows.length;
        const chunks = Math.ceil(totalRows / CHUNK_SIZE);
        
        let processedData: ExcelRow[] = [];
        
        const processChunk = (chunkIndex: number) => {
          const startIndex = chunkIndex * CHUNK_SIZE;
          const endIndex = Math.min(startIndex + CHUNK_SIZE, totalRows);
          const chunk = dataRows.slice(startIndex, endIndex);
          
          // Convert chunk to objects more efficiently
          const chunkData: ExcelRow[] = chunk.map(row => {
            const rowObj: ExcelRow = {};
            for (let i = 0; i < excelHeaders.length; i++) {
              rowObj[excelHeaders[i]] = row[i] || '';
            }
            return rowObj;
          });
          
          processedData = [...processedData, ...chunkData];
          
          // Update progress
          const progress = Math.round(((chunkIndex + 1) / chunks) * 100);
          setLoadingProgress(progress);
          
          // Update data state
          setData([...processedData]);
          
          // Process next chunk with a small delay to keep UI responsive
          if (chunkIndex < chunks - 1) {
            setTimeout(() => processChunk(chunkIndex + 1), 10);
          } else {
            resolve();
          }
        };
        
        // Start processing first chunk
        processChunk(0);
        
      } catch (err) {
        reject(err);
      }
    });
  };


  // Apply filters to data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return filters.every(filter => {
        if (!filter.value) return true;
        
        const cellValue = row[filter.column];
        if (filter.type === 'text') {
          return cellValue?.toString().toLowerCase().includes(filter.value.toLowerCase());
        } else {
          return cellValue === filter.value;
        }
      });
    });
  }, [data, filters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Virtualization
  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => VIRTUAL_ITEM_SIZE,
    overscan: 5,
  });

  const addFilter = (column: string, type: 'text' | 'select' = 'text') => {
    const existingFilter = filters.find(f => f.column === column);
    if (!existingFilter) {
      const options = type === 'select' ? 
        Array.from(new Set(data.map(row => row[column]).filter(Boolean))) : 
        undefined;
      
      setFilters([...filters, { column, value: '', type, options }]);
    }
  };

  const updateFilter = (column: string, value: string) => {
    setFilters(filters.map(f => f.column === column ? { ...f, value } : f));
  };

  const removeFilter = (column: string) => {
    setFilters(filters.filter(f => f.column !== column));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const downloadData = () => {
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_business_entity_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading Excel data... {loadingProgress}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Processing large dataset in chunks for better performance...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Excel File</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadExcelDataOptimized} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Business Entity Data (Optimized)
            </h3>
            <p className="text-sm text-muted-foreground">
              Large dataset loaded with virtualization - {data.length.toLocaleString()} records
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setUseVirtualization(!useVirtualization)}
            >
              {useVirtualization ? 'Disable Virtualization' : 'Enable Virtualization'}
            </Button>
            <Button onClick={downloadData} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
            {filters.map(filter => (
              <Badge key={filter.column} variant="secondary" className="flex items-center space-x-1">
                <span>{filter.column}: {filter.value}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter(filter.column)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Virtualized Table */}
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header} className="min-w-[150px] max-w-[200px] sticky top-0 bg-background z-10">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => handleSort(header)}
                      >
                        {header}
                      </span>
                      {sortColumn === header && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addFilter(header)}
                        className="h-6 w-6 p-0"
                      >
                        <Filter className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Filter Input */}
                    {filters.find(f => f.column === header) && (
                      <div className="mt-2">
                        {filters.find(f => f.column === header)?.type === 'select' ? (
                          <Select 
                            value={filters.find(f => f.column === header)?.value || ''}
                            onValueChange={(value) => updateFilter(header, value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All</SelectItem>
                              {filters.find(f => f.column === header)?.options?.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Filter..."
                            value={filters.find(f => f.column === header)?.value || ''}
                            onChange={(e) => updateFilter(header, e.target.value)}
                            className="h-8"
                          />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {useVirtualization ? (
                // Virtualized rendering
                <TableRow>
                  <TableCell colSpan={headers.length} className="p-0">
                    <div
                      ref={parentRef}
                      className="h-[600px] overflow-auto border rounded-md"
                    >
                      <div
                        style={{
                          height: `${virtualizer.getTotalSize()}px`,
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {virtualizer.getVirtualItems().map((virtualItem) => {
                          const row = sortedData[virtualItem.index];
                          return (
                            <div
                              key={virtualItem.index}
                              className="flex border-b hover:bg-muted/50"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                              }}
                            >
                              {headers.map((header, index) => (
                                <div
                                  key={header}
                                  className="flex-1 p-3 border-r last:border-r-0 min-w-[150px] max-w-[200px] flex items-center"
                                  style={{
                                    width: `${100 / headers.length}%`,
                                  }}
                                >
                                  <span className="truncate text-sm">
                                    {row[header]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Regular table rendering (first 1000 rows for performance)
                sortedData.slice(0, 1000).map((row, index) => (
                  <TableRow key={index}>
                    {headers.map(header => (
                      <TableCell 
                        key={header} 
                        className="min-w-[150px] max-w-[200px] p-3 text-sm"
                      >
                        <span className="truncate block">
                          {row[header]}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {sortedData.length.toLocaleString()} of {data.length.toLocaleString()} records
            {sortedData.length !== data.length && ` (${filters.length} filters applied)`}
          </span>
          <span>Virtual scrolling enabled for performance</span>
        </div>
      </div>
    </Card>
  );
};
