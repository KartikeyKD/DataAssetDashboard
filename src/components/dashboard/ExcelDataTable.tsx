import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
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

export const ExcelDataTable = () => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadExcelData();
  }, []);

  const loadExcelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the Excel file
      const response = await fetch('/Alation_Analytics_Schema_BusinessEntity.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch Excel file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }
      
      // First row contains headers
      const excelHeaders = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      // Convert to object format
      const formattedData: ExcelRow[] = dataRows.map(row => {
        const rowObj: ExcelRow = {};
        excelHeaders.forEach((header, index) => {
          rowObj[header] = row[index] || '';
        });
        return rowObj;
      });
      
      setHeaders(excelHeaders);
      setData(formattedData);
    } catch (err) {
      console.error('Error loading Excel file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Excel file');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to data
  const filteredData = data.filter(row => {
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

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
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
      // Headers
      headers.join(','),
      // Data rows
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
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
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
          <Button onClick={loadExcelData}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Business Entity Data from Excel</h3>
            <p className="text-sm text-muted-foreground">
              Data loaded from Alation_Analytics_Schema_BusinessEntity.xlsx
            </p>
          </div>
          <Button onClick={downloadData} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </Button>
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

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header} className="min-w-[200px]">
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
              {sortedData.map((row, index) => (
                <TableRow key={index}>
                  {headers.map(header => (
                    <TableCell key={header} className="max-w-[200px] truncate">
                      {row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {sortedData.length} of {data.length} records</span>
          <span>Click filter icon to add column filters</span>
        </div>
      </div>
    </Card>
  );
};
