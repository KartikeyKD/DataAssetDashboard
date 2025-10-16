import { TreeNode, TreeNodeData } from './TreeNode';
import React, { useState } from 'react';
interface DrilldownTreeProps {
  data: TreeNodeData;
  title?: string;
  className?: string;
  alignLevelsSingleRow?: boolean;
}

const DrilldownTree: React.FC<DrilldownTreeProps> = ({ data, title, className = '', alignLevelsSingleRow }) => {
  const [currentNode, setCurrentNode] = useState<TreeNodeData>(data);
  const [history, setHistory] = useState<TreeNodeData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeClick = (node: TreeNodeData) => {
    setSelectedNodeId(node.id);
    if (node.children && node.children.length > 0) {
      setHistory((h) => [...h, currentNode]);
      setCurrentNode(node);
    }
  };
    const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setCurrentNode(prev);
      setHistory((h) => h.slice(0, h.length - 1));
    }
  };

  return (
    <div className={`flex flex-col items-center overflow-x-auto overflow-y-auto min-w-full w-[100%] max-h-[70vh] pr-8 overflow-auto ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {history.length > 0 && (
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-full shadow hover:bg-gray-900 transition self-start"
        >
          Back
        </button>
      )}
      <div className={`flex flex-wrap justify-center h- items-center w-full ${alignLevelsSingleRow ? 'flex-row' : 'flex-col'}`}>
        {(currentNode.children || []).map((child) => (
          <div key={child.id} className="m-2 flex flex-col items-center">
            <TreeNode
              data={child}
              isExpanded={false}
              onToggle={() => handleNodeClick(child)}
              hasChildren={!!(child.children && child.children.length > 0)}
              level={1}
              isSelected={selectedNodeId === child.id}
              onSelect={() => handleNodeClick(child)}
            />
          </div>
        ))}
        {(!currentNode.children || currentNode.children.length === 0) && (
          <div className="text-gray-500 text-center mt-8">No further children</div>
        )}
      </div>
    </div>
  );
};

export default DrilldownTree;
