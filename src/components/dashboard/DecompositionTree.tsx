import React, { useState } from 'react';
import { TreeNode, TreeNodeData } from './TreeNode';
import { TreeConnection } from './TreeConnection';

interface DecompositionTreeProps {
  title: string;
  data: TreeNodeData;
  className?: string;
  alignLevelsSingleRow?: boolean;
}

export const DecompositionTree: React.FC<DecompositionTreeProps> = ({ 
  title, 
  data, 
  className = "",
  alignLevelsSingleRow = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data.id]));
  const [selectedNode, setSelectedNode] = useState<string | null>(data.id);
  const [focusedPath, setFocusedPath] = useState<string[]>([]);

  // Function to flatten columns from a node, filtering for Bronze schemas only
  const flattenColumnsFrom = (node: TreeNodeData): TreeNodeData[] => {
    const result: TreeNodeData[] = [];
    const walk = (n: TreeNodeData) => {
      if (!n) return;
      
      if (!n.children || n.children.length === 0) {
        // leaf – could be a column
        if (typeof n.id === 'string' && n.id.startsWith('column-')) {
          result.push(n);
        }
        return;
      }
      
      // For schema level, only walk children if it's a Bronze schema
      if (typeof n.id === 'string' && n.id.startsWith('schema-')) {
        if (n.label && n.label.toLowerCase().startsWith('bronze')) {
          n.children.forEach(child => walk(child));
        }
      } else {
        n.children.forEach(child => walk(child));
      }
    };
    walk(node);
    return result;
  };

  const toggleNode = (nodeId: string) => {
    // Don't handle root node here - let handleNodeSelect handle it
    if (nodeId === data.id) {
      return;
    }
    
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        // Remove this node and all its descendants from focused path
        setFocusedPath(prevPath => prevPath.slice(0, prevPath.indexOf(nodeId)));
      } else {
        newSet.add(nodeId);
        // Add this node to focused path
        setFocusedPath(prevPath => [...prevPath, nodeId]);
      }
      return newSet;
    });
  };

  const handleNodeSelect = (nodeId: string, level: number) => {
    setSelectedNode(nodeId);
    
    // If this is the root node, toggle its expansion
    if (level === 0) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
          setFocusedPath([]);
        } else {
          newSet.add(nodeId);
          setFocusedPath([]);
        }
        return newSet;
      });
      return;
    }
    
    // For non-root nodes, toggle expansion and implement drill-down behavior
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        // If already expanded, collapse it and all its descendants
        newSet.delete(nodeId);
        // Remove all descendants of this node
        const removeDescendants = (nodeId: string) => {
          const node = findNodeById(data, nodeId);
          if (node && node.children) {
            node.children.forEach(child => {
              newSet.delete(child.id);
              removeDescendants(child.id);
            });
          }
        };
        removeDescendants(nodeId);
        // Remove this node and all its descendants from focused path
        setFocusedPath(prevPath => prevPath.slice(0, prevPath.indexOf(nodeId)));
      } else {
        // If collapsed, expand it
        newSet.add(nodeId);
        // Add this node to focused path for drill-down
        setFocusedPath(prevPath => {
          const newPath = ['root'];
          for (let i = 1; i <= level; i++) {
            if (i === level) {
              newPath[i] = nodeId;
            } else if (prevPath[i]) {
              newPath[i] = prevPath[i];
            }
          }
          return newPath;
        });
      }
      return newSet;
    });
    
    // In inline view, scroll selected node into center view
    if (alignLevelsSingleRow) {
      setTimeout(() => {
        const element = document.getElementById(`node-${nodeId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 100);
    }
  };

  // Helper function to find a node by ID
  const findNodeById = (node: TreeNodeData, targetId: string): TreeNodeData | null => {
    if (node.id === targetId) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const shouldShowNode = (node: TreeNodeData, level: number): boolean => {
    // Always show root node
    if (level === 0) return true;
    
    // If no focused path (root selected), show all nodes
    if (focusedPath.length === 0) return true;
    
    // Check if this node is in the focused path
    for (let i = 0; i < focusedPath.length; i++) {
      if (focusedPath[i] === node.id) return true;
    }
    
    // Check if this node is a direct child of the last focused node
    const lastFocusedNodeId = focusedPath[focusedPath.length - 1];
    
    if (lastFocusedNodeId) {
      // For L1 nodes, check if they are direct children of root
      if (level === 1 && lastFocusedNodeId === 'root') return true;
      
      // For L2 nodes, check if their L1 parent matches
      if (level === 2 && lastFocusedNodeId.startsWith('l1-')) {
        const l1Name = lastFocusedNodeId.replace('l1-', '');
        if (node.id.startsWith(`l2-${l1Name}-`)) return true;
      }
      
      // For Schema nodes, check if their L2 parent matches
      if (level === 3 && lastFocusedNodeId.startsWith('l2-')) {
        const l2Path = lastFocusedNodeId.replace('l2-', '');
        if (node.id.startsWith(`schema-${l2Path}-`)) return true;
      }
      
      // For Table nodes, check if their Schema parent matches
      if (level === 4 && lastFocusedNodeId.startsWith('schema-')) {
        const schemaPath = lastFocusedNodeId.replace('schema-', '');
        if (node.id.startsWith(`table-${schemaPath}-`)) return true;
      }
    }
    
    return false;
  };

  const renderNode = (node: TreeNodeData, level: number): React.ReactNode => {
    let childrenToRender = node.children || [];
    
    // For inline view, handle special column filtering for L2 nodes
    if (alignLevelsSingleRow && level === 2) {
      // This is an L2 node, we want to show columns from Bronze schemas
      if (node) {
        childrenToRender = flattenColumnsFrom(node);
      }
    }
    
    // For inline view at level 2 (L2 entities), show all Bronze columns without filtering
    const filteredChildren = (alignLevelsSingleRow && level === 2) 
      ? childrenToRender 
      : childrenToRender.filter(childNode => shouldShowNode(childNode, level + 1));
    
    return (
      <div key={node.id} id={`node-${node.id}`} className="flex flex-col items-center gap-2">
        <TreeNode
          data={node}
          isExpanded={expandedNodes.has(node.id)}
          onToggle={() => toggleNode(node.id)}
          hasChildren={!!(node.children && node.children.length > 0)}
          level={level}
          isSelected={selectedNode === node.id}
          onSelect={() => handleNodeSelect(node.id, level)}
        />
        
        {expandedNodes.has(node.id) && filteredChildren.length > 0 && (
          <div className="flex flex-col items-center">
            {/* Children arranged horizontally with proper connections */}
            <div className={`flex gap-8 ${alignLevelsSingleRow ? 'flex-nowrap overflow-x-auto w-full items-start justify-center' : 'justify-center w-full flex-wrap'}`}>
              {filteredChildren.map((childNode, index) => (
                <div key={childNode.id} className="flex flex-col items-center">
                  {/* Individual connection line to each child */}
                  <div className={`relative w-8 h-6 flex items-center justify-center mb-2 ${alignLevelsSingleRow ? 'mt-8' : ''}`}>
                    <svg width="32" height="20" className="overflow-visible">
                      <line
                        x1="16"
                        y1="0"
                        x2="16"
                        y2="10"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />
                      <circle
                        cx="16"
                        cy="10"
                        r="2"
                        fill="#3b82f6"
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                  {renderNode(childNode, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTreeLevel = (nodes: TreeNodeData[], level: number = 0): React.ReactNode => {
    if (level === 0) {
      // Root level - single node at the top
      const rootNode = nodes[0];
      return (
        <div className="flex flex-col gap-0 items-center">
          <TreeNode
            data={rootNode}
            isExpanded={expandedNodes.has(rootNode.id)}
            onToggle={() => toggleNode(rootNode.id)}
            hasChildren={!!(rootNode.children && rootNode.children.length > 0)}
            level={level}
            isSelected={selectedNode === rootNode.id}
            onSelect={() => handleNodeSelect(rootNode.id, level)}
          />
          
          {expandedNodes.has(rootNode.id) && rootNode.children && rootNode.children.length > 0 && (
            <div className="flex flex-col items-center w-full">
              {/* L1 entities arranged horizontally with proper connections */}
              <div className={`flex gap-8 ${alignLevelsSingleRow ? 'flex-nowrap overflow-x-auto w-full items-start justify-center' : 'justify-center flex-wrap w-full'}`}>
                {rootNode.children
                  .filter(childNode => shouldShowNode(childNode, level + 1))
                  .map((childNode, index) => (
                  <div key={childNode.id} className="flex flex-col items-center">
                    {/* Individual connection line to each L1 child */}
                    <div className={`relative w-8 h-6 flex items-center justify-center mb-2 ${alignLevelsSingleRow ? 'mt-8' : ''}`}>
                      <svg width="32" height="20" className="overflow-visible">
                        <line
                          x1="16"
                          y1="0"
                          x2="16"
                          y2="10"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx="16"
                          cy="10"
                          r="2"
                          fill="#3b82f6"
                          className="transition-all duration-300"
                        />
                      </svg>
                    </div>
                    {renderNode(childNode, level + 1)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {title}
          </h2>
          <div className="w-full h-px bg-gray-200"></div>
        </div>
      )}
      
      <div className="overflow-x-auto h-fit w-full overflow-y-auto">
        <div className={`w-fullflex pt-4 pb-4 ${alignLevelsSingleRow ? 'justify-start pl-10' : 'justify-center'}`}>
          <div className="w-full">
            {renderTreeLevel([data])}
          </div>
        </div>
      </div>
    </div>
  );
};
