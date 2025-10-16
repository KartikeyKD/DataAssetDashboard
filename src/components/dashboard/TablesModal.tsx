import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Database, Table, Search } from 'lucide-react';

interface TablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const TablesModal: React.FC<TablesModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter schemas and tables based on search term
  const filteredSchemasWithTables = Object.entries(schemasWithTables).reduce((acc: any, [schemaKey, schema]: [string, any]) => {
    if (searchTerm === '') {
      acc[schemaKey] = schema;
      return acc;
    }
    
    const schemaNameMatch = schema.name.toLowerCase().includes(searchTerm.toLowerCase());
    const tableMatches = Object.entries(schema.tables).filter(([tableKey, table]: [string, any]) => {
      const tableName = table.name.toLowerCase().includes(searchTerm.toLowerCase());
      return tableName;
    });
    
    // Include schema if schema name matches or has matching tables
    if (schemaNameMatch || tableMatches.length > 0) {
      acc[schemaKey] = {
        ...schema,
        tables: tableMatches.length > 0 ? 
          Object.fromEntries(tableMatches) : 
          (schemaNameMatch ? schema.tables : {})
      };
    }
    
    return acc;
  }, {});

  const totalSchemas = Object.keys(filteredSchemasWithTables).length;
  const totalTables = Object.values(filteredSchemasWithTables).reduce((total: number, schema: any) => 
    total + Object.keys(schema.tables).length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            All Tables by Schema ({totalTables} tables in {totalSchemas} schemas)
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search schemas and tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {Object.entries(filteredSchemasWithTables).map(([schemaKey, schema]: [string, any]) => {
              const isExpanded = expandedSchemas.has(schemaKey);
              const tableCount = Object.keys(schema.tables).length;
              
              return (
                <Collapsible 
                  key={schemaKey} 
                  open={isExpanded} 
                  onOpenChange={() => toggleSchema(schemaKey)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Database className="h-4 w-4" />
                      <span className="font-semibold">{schema.name}</span>
                      <Badge variant="outline">{tableCount} tables</Badge>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    <div className="ml-6 space-y-3">
                      {Object.entries(schema.tables).map(([tableKey, table]: [string, any]) => (
                        <div key={tableKey} className="border rounded-lg bg-white shadow-sm">
                          {/* Table Header */}
                          <div className="p-3 border-b">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {table.name}
                                </h4>
                                {table.description && table.description !== table.name && (
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {table.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                  </p>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                  <Badge variant="secondary" className="text-xs">
                                    ID: {table.id || tableKey}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Table Analytics */}
                          <div className="p-3 bg-gray-50">
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Table Analytics</h5>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="bg-white rounded p-2">
                                <div className="text-gray-600 font-medium">Columns</div>
                                <div className="text-gray-900 font-bold">{table.columns?.length || 0}</div>
                              </div>
                              <div className="bg-white rounded p-2">
                                <div className="text-gray-600 font-medium">Documented</div>
                                <div className="text-gray-900 font-bold">
                                  {(() => {
                                    const totalCols = table.columns?.length || 0;
                                    const documentedCols = table.columns?.filter((col: any) => col.description && col.description.trim()).length || 0;
                                    const pct = totalCols > 0 ? ((documentedCols / totalCols) * 100).toFixed(1) : 0;
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
                            
                            {/* Top Data Types */}
                            {table.columns && (
                              <div className="mt-3">
                                <h6 className="text-xs font-medium text-gray-600 mb-1">Top Data Types</h6>
                                <div className="flex flex-wrap gap-1">
                                  {(() => {
                                    const typeCounts: Record<string, number> = {};
                                    table.columns.forEach((col: any) => {
                                      if (col.data_type) {
                                        typeCounts[col.data_type] = (typeCounts[col.data_type] || 0) + 1;
                                      }
                                    });
                                    return Object.entries(typeCounts)
                                      .sort(([,a], [,b]) => b - a)
                                      .slice(0, 3)
                                      .map(([type, count]) => (
                                        <Badge key={type} variant="outline" className="text-xs">
                                          {type}: {count}
                                        </Badge>
                                      ));
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {table.url && (
                            <div className="p-3 pt-0">
                              <a 
                                href={table.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View Table →
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
