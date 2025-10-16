import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Building, Building2, Search } from 'lucide-react';

interface PrimaryBusinessEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const PrimaryBusinessEntityModal: React.FC<PrimaryBusinessEntityModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedL1Entities, setExpandedL1Entities] = useState<Set<string>>(new Set());

  const toggleL1Entity = (l1EntityName: string) => {
    setExpandedL1Entities(prev => {
      const l1Entities = new Set(prev);
      if (l1Entities.has(l1EntityName)) {
        l1Entities.delete(l1EntityName);
      } else {
        l1Entities.add(l1EntityName);
      }
      return l1Entities;
    });
  };

  // Extract and filter primary business entities
  const getAllPrimaryEntities = () => {
    if (!data?.entity_heirarcy) return [];

    return Object.entries(data.entity_heirarcy).map(([l1EntityName, entityData]: [string, any]) => ({
      l1Name: l1EntityName,
      analytics: entityData.analytics,
      l2Entities: Object.entries(entityData.children || {}).map(([l2EntityName, l2Data]: [string, any]) => ({
        l2Name: l2EntityName,
        analytics: l2Data.analytics,
        schemas: Object.keys(l2Data.schemas || {})
      }))
    }));
  };

  const allPrimaryEntities = getAllPrimaryEntities();

  // Filter based on search term
  const filteredPrimaryEntities = allPrimaryEntities.filter(entity => {
    if (searchTerm === '') return true;

    const l1Match = entity.l1Name.toLowerCase().includes(searchTerm.toLowerCase());
    const l2Matches = entity.l2Entities.some(l2 =>
      l2.l2Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return l1Match || l2Matches;
  });

  const totalL1Entities = filteredPrimaryEntities.length;
  const totalL2Entities = filteredPrimaryEntities.reduce((total, entity) =>
    total + entity.l2Entities.length, 0);

  return (

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Primary Business Entities ({totalL1Entities} primary entities, {totalL2Entities} secondary entities)
          </DialogTitle>
        </DialogHeader>
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search primary and secondary business entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="overflow-auto h-[60vh] max-h-[60vh] min-h-[60vh]">
          {/* Overall Statistics */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-white rounded-xl p-4 border border-amber-100 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Overall Coverage Analytics</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-amber-600 font-medium text-xs mb-1">Primary Entities</div>
                <div className="text-amber-900 font-bold text-xl">{data?.entity_global_analytics?.total_l1_excluding_unassigned || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-amber-600 font-medium text-xs mb-1">Coverage %</div>
                <div className="text-amber-900 font-bold text-xl">{data?.global_analytics?.business_entity_primary_coverage_pct?.toFixed(2) || 0}%</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-amber-600 font-medium text-xs mb-1">Tagged Columns</div>
                <div className="text-amber-900 font-bold text-xl">{data?.entity_global_analytics?.columns_tagged_l1_count?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-amber-600 font-medium text-xs mb-1">Total Columns</div>
                <div className="text-amber-900 font-bold text-xl">{data?.global_analytics?.total_columns?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>


          <div className="space-y-4">
            {filteredPrimaryEntities.map((entity, index) => {
              const isExpanded = expandedL1Entities.has(entity.l1Name);

              return (
                <Collapsible
                  key={entity.l1Name}
                  open={isExpanded}
                  onOpenChange={() => toggleL1Entity(entity.l1Name)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Building className="h-4 w-4" />
                      <div className="text-left">
                        <span className="font-semibold">{entity.l1Name}</span>
                        <p className="text-xs text-gray-600 mt-1">
                          {entity.l2Entities.length} secondary entities, {entity.analytics?.column_count?.toLocaleString()} columns
                        </p>
                      </div>
                      <Badge variant="outline">{entity.l2Entities.length} Secondary</Badge>
                    </div>

                    {/* L1 Entity Analytics */}
                    <div className="flex gap-3 text-xs">
                      <div className="text-right">
                        <div className="font-medium">Tables: {entity.analytics?.table_count || 0}</div>
                        <div className="text-gray-600">Schemas: {entity.analytics?.schema_count || 0}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Primary Tagged: {entity.analytics?.columns_tagged_l1_pct?.toFixed(1) || 0}%</div>
                        <div className="text-gray-600">Secondary Tagged: {entity.analytics?.columns_tagged_l2_pct?.toFixed(1) || 0}%</div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2">
                    <div className="ml-6 space-y-3">
                      {/* L1 Entity Analytics */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Primary Business Entity Analytics</h5>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div className="bg-white rounded p-2">
                            <div className="text-blue-600 font-medium">Secondary Entities</div>
                            <div className="text-blue-900 font-bold">{entity.l2Entities.length}</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="text-green-600 font-medium">Schemas</div>
                            <div className="text-green-900 font-bold">{entity.analytics?.schema_count || 0}</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="text-purple-600 font-medium">Tables</div>
                            <div className="text-purple-900 font-bold">{entity.analytics?.table_count || 0}</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="text-orange-600 font-medium">Columns</div>
                            <div className="text-orange-900 font-bold">{entity.analytics?.column_count?.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Entities List */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Secondary Business Entities</h5>
                        <div className="space-y-2">
                          {entity.l2Entities.map((l2Entity: any, l2Index: number) => (
                            <div key={l2Entity.l2Name} className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Building2 className="h-3 w-3" />
                                  <div>
                                    <span className="font-medium text-sm">{l2Entity.l2Name}</span>
                                    <div className="text-xs text-gray-600">
                                      {l2Entity.schemas.length} schemas, {l2Entity.analytics?.table_count || 0} tables, {l2Entity.analytics?.column_count?.toLocaleString()} columns
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">{l2Entity.schemas.length} schemas</Badge>
                                </div>

                                {/* L2 Entity Analytics */}
                                <div className="flex gap-3 text-xs">
                                  <div className="text-right">
                                    <div className="font-medium">Tables: {l2Entity.analytics?.table_count || 0}</div>
                                    <div className="text-gray-600">Columns: {l2Entity.analytics?.column_count?.toLocaleString() || 0}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">Doc: {l2Entity.analytics?.columns_with_description_pct?.toFixed(1) || 0}%</div>
                                    <div className="text-gray-600">Missing Secondary: {l2Entity.analytics?.columns_missing_l2_pct?.toFixed(1) || 0}%</div>
                                  </div>
                                </div>
                              </div>

                              {/* Schema List */}
                              {l2Entity.schemas.length > 0 && (
                                <div className="mt-2 ml-6">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Schemas:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {l2Entity.schemas.map((schemaName: string, schemaIndex: number) => (
                                      <Badge key={schemaIndex} variant="outline" className="text-xs">
                                        {schemaName}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
