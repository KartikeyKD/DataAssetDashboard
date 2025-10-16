import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Database, Table, Columns } from 'lucide-react';

interface TablesHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const TablesHierarchyModal: React.FC<TablesHierarchyModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleSchema = (schemaKey: string) => {
    setExpandedSchemas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schemaKey)) {
        newSet.delete(schemaKey);
      } else {
        newSet.add(schemaKey);
      }
      return newSet;
    });
  };

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

  // Extract all schemas and their tables from the entity hierarchy data
  const getAllSchemasWithTables = () => {
    if (!data?.entity_heirarcy) return {};

    const schemasMap: any = {};

    // Iterate through all L1 entities
    Object.values(data.entity_heirarcy).forEach((l1Entity: any) => {
      if (l1Entity.children) {
        // Iterate through L2 entities
        Object.values(l1Entity.children).forEach((l2Entity: any) => {
          if (l2Entity.schemas) {
            // Add schemas to our map
            Object.entries(l2Entity.schemas).forEach(([schemaName, schemaData]: [string, any]) => {
              if (!schemasMap[schemaName]) {
                schemasMap[schemaName] = {
                  name: schemaName,
                  tables: {},
                  analytics: schemaData.analytics || {}
                };
              }

              // Merge tables from this schema
              if (schemaData.tables) {
                Object.entries(schemaData.tables).forEach(([tableName, tableData]: [string, any]) => {
                  schemasMap[schemaName].tables[tableName] = {
                    name: tableName,
                    ...tableData
                  };
                });
              }
            });
          }
        });
      }
    });

    return schemasMap;
  };

  const schemasWithTables = getAllSchemasWithTables();

  // Use global analytics for accurate counts
  const totalSchemas = data?.global_analytics?.total_schemas || 0;
  const totalTables = data?.global_analytics?.total_tables || 0;
  const totalColumns = data?.global_analytics?.total_columns || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tables Hierarchy ({totalTables} tables across {totalSchemas} schemas)
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="overflow-auto h-[70vh]">
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Overall Statistics</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-blue-600 font-medium">Total Schemas</div>
                  <div className="text-blue-900 font-bold text-2xl">{totalSchemas}</div>
                </div>
                <div className="bg-green-50 rounded p-3">
                  <div className="text-green-600 font-medium">Total Tables</div>
                  <div className="text-green-900 text-2xl font-bold">{totalTables}</div>
                </div>
                <div className="bg-purple-50 rounded p-3">
                  <div className="text-purple-600 font-medium">Total Columns</div>
                  <div className="text-purple-900 font-bold text-2xl">{totalColumns.toLocaleString()}</div>
                </div>
                <div className="bg-orange-50 rounded p-3">
                  <div className="text-orange-600 font-medium">Avg Tables/Schema</div>
                  <div className="text-orange-900 font-bold text-2xl">
                    {totalSchemas > 0 ? (totalTables / totalSchemas).toFixed(1) : 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Schemas and Tables Hierarchy */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Schema → Table → Column Hierarchy
              </h4>

              <div className="space-y-4">
                {Object.entries(schemasWithTables).map(([schemaKey, schema]: [string, any]) => {
                  const isSchemaExpanded = expandedSchemas.has(schemaKey);
                  const tableCount = Object.keys(schema.tables).length;
                  const schemaColumnCount = Object.values(schema.tables).reduce((total: number, table: any) =>
                    total + (table.columns?.length || 0), 0);

                  return (
                    <Collapsible
                      key={schemaKey}
                      open={isSchemaExpanded}
                      onOpenChange={() => toggleSchema(schemaKey)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isSchemaExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Database className="h-4 w-4" />
                          <div className="text-left">
                            <span className="font-semibold">{schema.name}</span>
                            <p className="text-xs text-gray-600 mt-1">{tableCount} tables, {schemaColumnCount} columns</p>
                          </div>
                          <Badge variant="outline">{tableCount} tables</Badge>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-2">
                        <div className="ml-6 space-y-3">
                          {Object.entries(schema.tables).map(([tableKey, table]: [string, any]) => {
                            const isTableExpanded = expandedTables.has(table.id?.toString() || tableKey);
                            const columnCount = table.columns?.length || 0;

                            return (
                              <Collapsible
                                key={tableKey}
                                open={isTableExpanded}
                                onOpenChange={() => toggleTable(table.id?.toString() || tableKey)}
                              >
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    {isTableExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <Table className="h-3 w-3" />
                                    <div className="text-left">
                                      <span className="font-medium text-sm">{table.name}</span>
                                      {table.description && table.description !== table.name && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                          {table.description.replace(/<[^>]*>/g, '').substring(0, 60)}...
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="text-xs">{columnCount}</Badge>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {table.id}
                                  </Badge>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="mt-2">
                                  <div className="ml-6 space-y-3">
                                    {/* Table Analytics */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h6 className="text-xs font-medium text-gray-700 mb-2">Table Analytics</h6>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
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
                                      <h6 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        <Columns className="h-3 w-3" />
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
