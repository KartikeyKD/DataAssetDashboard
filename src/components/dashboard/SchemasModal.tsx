import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Database, Search } from 'lucide-react';
import { SchemaDetailsModal } from './SchemaDetailsModal';
import { useGovernanceData } from "@/hooks/useGovernanceData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface SchemasModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemas: any[];
}

export const SchemasModal: React.FC<SchemasModalProps> = ({
  isOpen,
  onClose,
  schemas
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [detailedSchema, setDetailedSchema] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
const [schemasData, setSchemasData] = useState<any[]>([]);
  const filteredSchemas = schemasData?.filter((schema: any) => {
    const name = schema.name || schema.title || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];


  useEffect(() => {
       setSchemasData(schemas.filter(
  (schema: any) => !schema.name.startsWith('USER$')
) || []);
    }, [schemas]);

  const handleViewSchema = (schema: any) => {
    setDetailedSchema(schema);
    setShowDetailsModal(true);
  };

  const toggleDescription = (schemaId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schemaId)) newSet.delete(schemaId);
      else newSet.add(schemaId);
      return newSet;
    });
  };
const nonUserSchemasCount = schemasData?.filter(
  (schema: any) => !schema.name.startsWith('USER$')
).length || 0;
  if (!isOpen) return null; // control visibility
console.log(schemasData)
  return (
     <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            All Schemas ({filteredSchemas.length} of {nonUserSchemasCount || 0})
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search schemas by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {filteredSchemas?.map((schema: any, index: number) => (
              <div key={schema.id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {schema.name || schema.title || `${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {schema.title && schema.title !== schema.name ? schema.title : ''}
                    </p>
                    {schema.description && (
                      <div>
                        <div 
                          className="text-xs text-gray-500"
                          dangerouslySetInnerHTML={{ 
                            __html: expandedDescriptions.has(schema.id?.toString() || index.toString()) 
                              ? schema.description.replace(/<[^>]*>/g, '') 
                              : schema.description.replace(/<[^>]*>/g, '').substring(0, 150) + (schema.description.replace(/<[^>]*>/g, '').length > 150 ? '...' : '')
                          }}
                        />
                        {schema.description.replace(/<[^>]*>/g, '').length > 150 && (
                          <button
                            onClick={() => toggleDescription(schema.id?.toString() || index.toString())}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                          >
                            {expandedDescriptions.has(schema.id?.toString() || index.toString()) ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    ID: {schema.id || index}
                  </Badge>
                </div>
                
                {/* Analytics Section */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Schema Analytics</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-600 font-medium">Tables Count</div>
                      <div className="text-gray-900 font-bold text-lg">{schema.tables?.length || 0}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-600 font-medium">Total Columns</div>
                      <div className="text-gray-900 font-bold text-lg">
                        {schema.tables?.reduce((total: number, table: any) => total + (table.columns?.length || 0), 0) || 0}
                      </div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-600 font-medium">Documented Columns</div>
                      <div className="text-gray-900 font-bold">
                        {(() => {
                          const totalCols = schema.tables?.reduce((total: number, table: any) => total + (table.columns?.length || 0), 0) || 0;
                          const documentedCols = schema.tables?.reduce((total: number, table: any) => 
                            total + (table.columns?.filter((col: any) => col.description && col.description.trim()).length || 0), 0) || 0;
                          const pct = totalCols > 0 ? ((documentedCols / totalCols) * 100).toFixed(1) : 0;
                          return `${documentedCols} (${pct}%)`;
                        })()}
                      </div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-600 font-medium">Data Source ID</div>
                      <div className="text-gray-900 font-bold">{schema.ds_id || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleViewSchema(schema)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs"
                >
                  View Schema Hierarchy →
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
      
      {/* Schema Details Modal */}
      <SchemaDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setDetailedSchema(null);
        }}
        schema={detailedSchema}
      />
    </Dialog>
  );
};
