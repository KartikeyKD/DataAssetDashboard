import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Database, Table, Columns } from 'lucide-react';

interface SchemaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: any;
}

export const SchemaDetailsModal: React.FC<SchemaDetailsModalProps> = ({
  isOpen,
  onClose,
  schema
}) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableId: string) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableId)) {
        newSet.delete(tableId);
      } else {
        newSet.add(tableId);
      }
      return newSet;
    });
  };

  if (!schema) return null;

  const totalTables = schema.tables?.length || 0;
  const totalColumns = schema.tables?.reduce((total: number, table: any) => total + (table.columns?.length || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-8xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Schema Hierarchy: {schema.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Schema Overview */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {schema.name}
                  </h3>
                  {schema.title && (
                    <p className="text-gray-600 mb-2">{schema.title}</p>
                  )}
                  {schema.description && (
                    <div 
                      className="text-sm text-gray-700 line-clamp-3 mb-3"
                      dangerouslySetInnerHTML={{ 
                        __html: schema.description.replace(/<[^>]*>/g, '').substring(0, 300)
                      }}
                    />
                  )}
                </div>
                <Badge variant="outline" className="ml-4">
                  Schema ID: {schema.id}
                </Badge>
              </div>
              
              {/* Schema Statistics */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Schema Overview</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 rounded p-3">
                    <div className="text-blue-600 font-medium">Total Tables</div>
                    <div className="text-blue-900 font-bold text-2xl">{totalTables}</div>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <div className="text-green-600 font-medium">Total Columns</div>
                    <div className="text-green-900 font-bold text-2xl">{totalColumns.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <div className="text-purple-600 font-medium">Documented Columns</div>
                    <div className="text-purple-900 font-bold text-2xl">
                      {(() => {
                        const documentedCols = schema.tables?.reduce((total: number, table: any) => 
                          total + (table.columns?.filter((col: any) => col.description && col.description.trim()).length || 0), 0) || 0;
                        const pct = totalColumns > 0 ? ((documentedCols / totalColumns) * 100).toFixed(1) : 0;
                        return `${(documentedCols / 1000).toFixed(1)}K (${pct}%)`;
                      })()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-gray-600 font-medium">Data Source</div>
                    <div className="text-gray-900 font-bold text-2xl">{schema.ds_id || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Hierarchy */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Table className="h-5 w-5" />
                Tables ({totalTables})
              </h4>
              
              <div className="space-y-3">
                {schema.tables?.map((table: any, index: number) => {
                  const isExpanded = expandedTables.has(table.id?.toString() || index.toString());
                  const columnCount = table.columns?.length || 0;
                  
                  return (
                    <Collapsible 
                      key={table.id || index} 
                      open={isExpanded} 
                      onOpenChange={() => toggleTable(table.id?.toString() || index.toString())}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Table className="h-4 w-4" />
                          <div className="text-left">
                            <span className="font-semibold">{table.name}</span>
                            {table.description && table.description !== table.name && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {table.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">{columnCount} columns</Badge>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          ID: {table.id}
                        </Badge>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2">
                        <div className="ml-6 space-y-3">
                          {/* Table Analytics */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Table Analytics</h5>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="bg-white rounded p-2">
                                <div className="text-gray-600 font-medium">Columns</div>
                                <div className="text-gray-900 font-bold">{columnCount}</div>
                              </div>
                              <div className="bg-white rounded p-2">
                                <div className="text-gray-600 font-medium">Documented</div>
                                <div className="text-gray-900 font-bold">
                                  {(() => {
                                    const documentedCols = table.columns?.filter((col: any) => col.description && col.description.trim()).length || 0;
                                    const pct = columnCount > 0 ? ((documentedCols / columnCount) * 100).toFixed(1) : 0;
                                    return `${documentedCols} (${pct}%)`;
                                  })()}
                                </div>
                              </div>
                              <div className="bg-white rounded p-2">
                                <div className="text-gray-600 font-medium">Data Types</div>
                                <div className="text-gray-900 font-bold">
                                  {(() => {
                                    const dataTypes = new Set(
                                      table.columns?.map((col: any) => col.data_type).filter(Boolean) || []
                                    );
                                    return dataTypes.size;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Columns List */}
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Columns className="h-4 w-4" />
                              Columns ({columnCount})
                            </h6>
                            
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                              {table.columns?.map((column: any, colIndex: number) => (
                                <div key={column.id || colIndex} className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 text-sm">{column.name}</div>
                                      <div className="text-xs text-gray-600 mb-2">{column.data_type}</div>
                                      {column.description && (
                                        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border">
                                          <div className="font-medium text-gray-600 mb-1">Business Description:</div>
                                          <div 
                                            className="text-gray-800"
                                            dangerouslySetInnerHTML={{ 
                                              __html: column.description 
                                            }}
                                          />
                                        </div>
                                      )}
                                      {!column.description && (
                                        <div className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded border">
                                          No business description available
                                        </div>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {column.id}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
