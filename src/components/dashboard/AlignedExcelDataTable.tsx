import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as XLSX from 'xlsx';
import { useGovernanceData } from "@/hooks/useGovernanceData";

interface ExcelRow {
  [key: string]: any;
}

interface ColumnFilter {
  column: string;
  value: string;
  type: 'text' | 'select';
  options?: string[];
}

const CHUNK_SIZE = 100;
const VIRTUAL_ITEM_SIZE = 40;
const COLUMN_WIDTH = 200; // Fixed width for all columns

export const AlignedExcelDataTable = () => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("business-meta");
  const { data: governanceData } = useGovernanceData();
  const [error, setError] = useState<string | null>(null);

  // Generate Business Entity Data - moved to top level to fix hooks order
  const businessEntityData = useMemo(() => {
    if (!governanceData?.entity_heirarcy) return [];
    
    return Object.entries(governanceData.entity_heirarcy)
      .filter(([name]) => name !== 'Unassigned L1')
      .map(([l1Name, l1Data]: [string, any]) => {
        const analytics = l1Data.analytics;
        const l2Entities = Object.keys(l1Data.children || {}).filter(name => name !== 'Unassigned L2');
        
        return {
          'Primary Business Entity': l1Name,
          'Secondary Business Entity': l2Entities.join(', ') || 'None',
          'Total Schemas': analytics.schema_count || 0,
          'Total Tables': analytics.table_count || 0,
          'Total Columns': analytics.column_count || 0
        };
      });
  }, [governanceData]);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(true);
  const [datasourceMapping, setDatasourceMapping] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const mapping = await loadDatasourceMapping();
        await loadExcelDataOptimized(mapping);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const loadDatasourceMapping = async () => {
    try {
      const response = await fetch(`/datasource.json?t=${Date.now()}`);
      if (response.ok) {
        const mapping = await response.json();
        setDatasourceMapping(mapping);
        return mapping;
      }
    } catch (err) {
      console.warn('Failed to load datasource mapping:', err);
    }
    return {};
  };

  const loadExcelDataOptimized = async (mapping: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setIsProcessing(true);
      
      const response = await fetch('/Alation_Analytics_Schema_BusinessEntity.xlsx');
      if (!response.ok) {
        throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Excel file is empty');
      }
      
      await parseExcelWithChunking(arrayBuffer, mapping);
      
    } catch (err) {
      console.error('Error loading Excel file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Excel file');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const parseExcelWithChunking = async (arrayBuffer: ArrayBuffer, mapping: Record<string, string>) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          cellDates: false,
          cellNF: false,
          cellText: false
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: true,
          defval: ''
        });
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        const excelHeaders = jsonData[0] as string[];
        
        // Reorder columns as requested: Business Entity L1, Business Entity L2, DataSource, Schema, Table Name, Column Name, Data Type, Business Description
        const columnOrder = [
          'Business Entity L1',
          'Business Entity L2', 
          'DataSource',
          'Schema',
          'Table Name',
          'Column Name',
          'Data Type',
          'Business Description'
        ];
        
        // Filter and reorder headers based on the desired order
        const reorderedHeaders = columnOrder.filter(header => excelHeaders.includes(header));
        
        setHeaders(reorderedHeaders);
        
        const dataRows = jsonData.slice(1) as any[][];
        const totalRows = dataRows.length;
        const chunks = Math.ceil(totalRows / CHUNK_SIZE);
        
        let processedData: ExcelRow[] = [];
        
        const processChunk = (chunkIndex: number) => {
          const startIndex = chunkIndex * CHUNK_SIZE;
          const endIndex = Math.min(startIndex + CHUNK_SIZE, totalRows);
          const chunk = dataRows.slice(startIndex, endIndex);
          
          const chunkData: ExcelRow[] = chunk.map(row => {
            const rowObj: ExcelRow = {};
            // Map data according to the reordered headers
            reorderedHeaders.forEach(header => {
              const originalIndex = excelHeaders.indexOf(header);
              let value = originalIndex !== -1 ? (row[originalIndex] || '') : '';
              
              // Map DataSource ID to name if available
              if (header === 'DataSource') {
                if (mapping[value]) {
                  value = mapping[value];
                } else {
                  // Fallback mapping
                  const fallbackMapping: Record<string, string> = {
                    '1': 'Snowflake Dev',
                    '2': 'Snowflake Prod',
                    '3': 'PostgreSQL Main',
                    '4': 'MySQL Analytics',
                    '5': 'Oracle ERP'
                  };
                  if (fallbackMapping[value]) {
                    value = fallbackMapping[value];
                  }
                }
              }
              
              rowObj[header] = value;
            });
            return rowObj;
          });
          
          processedData = [...processedData, ...chunkData];
          
          const progress = Math.round(((chunkIndex + 1) / chunks) * 100);
          setLoadingProgress(progress);
          setData([...processedData]);
          
          if (chunkIndex < chunks - 1) {
            setTimeout(() => processChunk(chunkIndex + 1), 10);
          } else {
            resolve();
          }
        };
        
        processChunk(0);
        
      } catch (err) {
        console.error('Error parsing Excel:', err);
        reject(err);
      }
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return filters.every(filter => {
        if (!filter.value) return true;
        
        let cellValue = row[filter.column];
        
        // Apply datasource mapping for filtering
        if (filter.column === 'DataSource' && datasourceMapping[cellValue]) {
          cellValue = datasourceMapping[cellValue];
        }
        
        if (filter.type === 'text') {
          return cellValue?.toString().toLowerCase().includes(filter.value.toLowerCase());
        } else {
          return cellValue === filter.value;
        }
      });
    });
  }, [data, filters, datasourceMapping]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Apply datasource mapping for sorting
      if (sortColumn === 'DataSource') {
        aValue = datasourceMapping[aValue] || aValue;
        bValue = datasourceMapping[bValue] || bValue;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection, datasourceMapping]);

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => VIRTUAL_ITEM_SIZE,
    overscan: 5,
  });

  const addFilter = (column: string, type: 'text' | 'select' = 'text') => {
    const existingFilter = filters.find(f => f.column === column);
    if (!existingFilter) {
      let options;
      if (type === 'select') {
        const uniqueValues = Array.from(new Set(data.map(row => {
          let value = row[column];
          // Apply datasource mapping for select options
          if (column === 'DataSource' && datasourceMapping[value]) {
            value = datasourceMapping[value];
          }
          return value;
        }).filter(Boolean)));
        options = uniqueValues;
      }
      
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
              Loading Meta Data... {loadingProgress}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
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
          <div className="text-sm text-muted-foreground">
            <p>Data loaded: {data.length} records</p>
            <p>Headers: {headers.length} columns</p>
          </div>
          <Button onClick={() => {
            setError(null);
            loadExcelDataOptimized(datasourceMapping);
          }} disabled={isProcessing}>
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
    <Card className="p-6 w-full">
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Business Data
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'business-entity' 
                ? `Business Entity Data - ${businessEntityData.length} entities`
                : `Business Meta Data - ${data.length.toLocaleString()} records`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={()=>collapsed?downloadData():setCollapsed(!collapsed)} className="flex items-center space-x-2">
              {collapsed?(
                <>
                <Download className="h-4 w-4" />
              <span>Download CSV</span>
                </>
                ):"Show Table"}
            </Button>
            {collapsed&&<Button onClick={()=>setCollapsed(!collapsed)} className="flex items-center space-x-2">
                Hide Table
            </Button>}
          </div>
        </div>

     {collapsed && <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="business-entity" 
              className={activeTab === "business-entity" ? "bg-[#323997] text-white" : ""}
            >
              Business Entity Data
            </TabsTrigger>
            <TabsTrigger 
              value="business-meta" 
              className={activeTab === "business-meta" ? "bg-[#323997] text-white" : ""}
            >
              Business Meta Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="business-entity" className="mt-6">
            <BusinessEntityTable data={businessEntityData} />
          </TabsContent>
          
          <TabsContent value="business-meta" className="mt-6">

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

        {/* Perfectly Aligned Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Fixed Header */}
          <div className="sticky top-0 bg-background z-10 border-b">
            <div className="flex">
              {headers.map((header, index) => (
                <div
                  key={header}
                  className={`p-3 border-r last:border-r-0 ${
                    index === headers.length - 1 ? 'bg-blue-50 border-blue-200 flex-1' : 'bg-muted/50 flex-shrink-0'
                  }`}
                  style={{ 
                    width: index === headers.length - 1 ? 'auto' : `${COLUMN_WIDTH}px`
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span 
                      className="cursor-pointer hover:text-primary font-medium text-sm"
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
                    <div>
                      {filters.find(f => f.column === header)?.type === 'select' ? (
                        <Select 
                          value={filters.find(f => f.column === header)?.value || ''}
                          onValueChange={(value) => updateFilter(header, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
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
                          className="h-8 text-xs"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          {useVirtualization ? (
            // Virtualized rendering with perfect alignment
            <div
              ref={parentRef}
              className="h-[600px] overflow-auto"
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
                      className="flex border-b hover:bg-muted/50 bg-background"
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
                          className={`p-3 border-r last:border-r-0 flex items-center ${
                            index === headers.length - 1 ? 'bg-blue-50/30 flex-1' : 'flex-shrink-0'
                          }`}
                          style={{ 
                            width: index === headers.length - 1 ? 'auto' : `${COLUMN_WIDTH}px`
                          }}
                        >
                          <span className="truncate text-sm w-full">
                            {row[header]}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Regular rendering with perfect alignment
            <div className="max-h-[600px] overflow-auto">
              {sortedData.slice(0, 1000).map((row, index) => (
                <div
                  key={index}
                  className="flex border-b hover:bg-muted/50"
                >
                  {headers.map((header, index) => (
                    <div
                      key={header}
                      className={`p-3 border-r last:border-r-0 flex items-center ${
                        index === headers.length - 1 ? 'bg-blue-50/30 flex-1' : 'flex-shrink-0'
                      }`}
                      style={{ 
                        width: index === headers.length - 1 ? 'auto' : `${COLUMN_WIDTH}px`
                      }}
                    >
                      <span className="truncate text-sm w-full">
                        {row[header]}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {sortedData.length.toLocaleString()} of {data.length.toLocaleString()} records
                {sortedData.length !== data.length && ` (${filters.length} filters applied)`}
              </span>
              <span>Perfect column alignment with fixed widths</span>
            </div>
          </TabsContent>
        </Tabs>

     }
      </div>
    </Card>
  );
};

// Business Entity Table Component
const BusinessEntityTable = ({ data }: { data: any[] }) => {
  const headers = ['Primary Business Entity', 'Secondary Business Entity', 'Total Schemas', 'Total Tables', 'Total Columns'];
  
  return (
    <div className="space-y-4 w-full">
      {/* Table Header */}
      <div className="flex border-b-2 border-muted bg-muted/30 w-full">
        {headers.map((header, index) => (
          <div
            key={header}
            className={`p-3 border-r last:border-r-0 font-semibold text-sm ${
              index === headers.length - 1 ? 'bg-blue-50/30 flex-1' : 'flex-shrink-0'
            }`}
            style={{ 
              width: index === headers.length - 1 ? 'auto' : 'auto',
              minWidth: `${COLUMN_WIDTH}px`
            }}
          >
            {header}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className="max-h-[600px] overflow-auto w-full">
        {data.map((row, index) => (
          <div
            key={index}
            className="flex border-b hover:bg-muted/50"
          >
            {headers.map((header, index) => (
              <div
                key={header}
                className={`p-3 border-r last:border-r-0 flex items-center ${
                  index === headers.length - 1 ? 'bg-blue-50/30 flex-1' : 'flex-shrink-0'
                }`}
                style={{ 
                  width: index === headers.length - 1 ? 'auto' : 'auto',
                  minWidth: `${COLUMN_WIDTH}px`
                }}
              >
                <span className="truncate text-sm w-full">
                  {row[header]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {data.length} business entities
        </span>
        <span>Entity data from governance hierarchy</span>
      </div>
    </div>
  );
};
