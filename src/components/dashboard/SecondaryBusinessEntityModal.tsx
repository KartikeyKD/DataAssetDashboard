import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Building2, Search, Tag } from 'lucide-react';

interface SecondaryBusinessEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const SecondaryBusinessEntityModal: React.FC<SecondaryBusinessEntityModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all secondary business entities with their primary parents
  const getAllSecondaryEntities = () => {
    if (!data?.entity_heirarcy) return [];
    
    const l2Entities: any[] = [];
    
    Object.entries(data.entity_heirarcy).forEach(([l1EntityName, entityData]: [string, any]) => {
      if (entityData.children) {
        Object.entries(entityData.children).forEach(([l2EntityName, l2Data]: [string, any]) => ({
          l2Name: l2EntityName,
          l1Parent: l1EntityName,
          analytics: l2Data.analytics,
          schemas: Object.keys(l2Data.schemas || {})
        }));
      }
    });
    
    return Object.entries(data.entity_heirarcy).flatMap(([l1EntityName, entityData]: [string, any]) => {
      if (!entityData.children) return [];
      
      return Object.entries(entityData.children).map(([l2EntityName, l2Data]: [string, any]) => ({
        l2Name: l2EntityName,
        l1Parent: l1EntityName,
        analytics: l2Data.analytics,
        schemas: Object.keys(l2Data.schemas || {})
      }));
    });
  };

  const allSecondaryEntities = getAllSecondaryEntities();

  // Filter based on search term
  const filteredSecondaryEntities = allSecondaryEntities.filter(entity => {
    if (searchTerm === '') return true;
    
    const l1Match = entity.l1Parent.toLowerCase().includes(searchTerm.toLowerCase());
    const l2Match = entity.l2Name.toLowerCase().includes(searchTerm.toLowerCase());
    const schemaMatch = entity.schemas.some((schemaName: string) => 
      schemaName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return l1Match || l2Match || schemaMatch;
  });

  const totalSecondaryEntities = filteredSecondaryEntities.length;
  const primaryParentsCount = new Set(filteredSecondaryEntities.map(e => e.l1Parent)).size;

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Secondary Business Entities ({totalSecondaryEntities} secondary entities from {primaryParentsCount} primary entities)
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-10"
            placeholder="Search secondary business entities, primary parents, or schemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="overflow-auto h-[60vh]">
        {/* Overall Statistics */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-white rounded-xl p-4 border border-rose-100 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Overall Coverage Analytics</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-rose-600 font-medium text-xs mb-1">Secondary Entities</div>
              <div className="text-rose-900 font-bold text-xl">{data?.entity_global_analytics?.total_l2_excluding_unassigned || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-rose-600 font-medium text-xs mb-1">Coverage %</div>
              <div className="text-rose-900 font-bold text-xl">{data?.global_analytics?.business_entity_secondary_coverage_pct?.toFixed(2) || 0}%</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-rose-600 font-medium text-xs mb-1">Tagged Columns</div>
              <div className="text-rose-900 font-bold text-xl">{data?.entity_global_analytics?.columns_tagged_l2_count?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-rose-600 font-medium text-xs mb-1">Total Columns</div>
              <div className="text-rose-900 font-bold text-xl">{data?.global_analytics?.total_columns?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
        
        
          <div className="space-y-3">
            {filteredSecondaryEntities.map((entity, index) => (
              <div key={`${entity.l1Parent}-${entity.l2Name}`} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-semibold text-gray-900">{entity.l2Name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Tag className="h-3 w-3" />
                        Under Primary Business Entity: <span className="font-medium text-blue-600">{entity.l1Parent}</span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {entity.l1Parent}
                    </Badge>
                  </div>
                  
                  {/* Secondary Entity Analytics */}
                  <div className="flex gap-4 text-xs">
                    <div className="text-right">
                      <div className="font-medium">Schemas: {entity.schemas.length}</div>
                      <div className="text-gray-600">Tables: {entity.analytics?.table_count || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Columns: {entity.analytics?.column_count?.toLocaleString()}</div>
                      <div className="text-gray-600">Secondary Business Entity Coverage: {entity.analytics?.columns_tagged_l2_pct?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Business Description: {entity.analytics?.columns_with_description_pct?.toFixed(1) || 0}%</div>
                      <div className="text-gray-600">Missing Secondary Business Entity: {entity.analytics?.columns_missing_l2_pct?.toFixed(1) || 0}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Secondary Business Entity Analytics */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Secondary Business Entity Analytics</h5>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-blue-600 font-medium">Primary Entity</div>
                      <div className="text-blue-900 font-bold">{entity.l1Parent}</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-green-600 font-medium">Schemas</div>
                      <div className="text-green-900 font-bold">{entity.schemas.length}</div>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <div className="text-purple-600 font-medium">Tables</div>
                      <div className="text-purple-900 font-bold">{entity.analytics?.table_count || 0}</div>
                    </div>
                    <div className="bg-orange-50 rounded p-2">
                      <div className="text-orange-600 font-medium">Columns</div>
                      <div className="text-orange-900 font-bold">{entity.analytics?.column_count?.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-blue-600 font-medium">Secondary Business Entity Coverage</div>
                      <div className="text-blue-900 font-bold">{entity.analytics?.columns_tagged_l2_pct?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-green-600 font-medium">Business Description</div>
                      <div className="text-green-900 font-bold">{entity.analytics?.columns_with_description_pct?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="bg-red-50 rounded p-2">
                      <div className="text-red-600 font-medium">Missing Secondary Business Entity</div>
                      <div className="text-red-900 font-bold">{entity.analytics?.columns_missing_l2_pct?.toFixed(1) || 0}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Schema List */}
                {entity.schemas.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Associated Schemas ({entity.schemas.length})</h6>
                    <div className="flex flex-wrap gap-2">
                      {entity.schemas.map((schemaName: string, schemaIndex: number) => (
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
        </ScrollArea>
        </DialogContent>
</Dialog>
  );
};
