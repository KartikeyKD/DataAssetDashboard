import React, { useEffect, useState } from "react";
import * as d3 from "d3-force";
import * as d3Selection from "d3-selection";
import { TreeNodeData } from "./TreeNode";

interface ForceChartProps {
  data: TreeNodeData;
  width: number;
  height: number;
  index?: number;
  onNodeClick?: (node: TreeNodeData, isCenter: boolean, index?: number, event?: any) => void;
  onNodeHover?: (node: TreeNodeData | null, event?: any) => void;
}

interface PosNode extends TreeNodeData {
  x: number;
  y: number;
  r?: number;
  isCenter?: boolean;
}

const ForceChart: React.FC<ForceChartProps> = ({
  data,
    width= window.innerWidth,
    height= window.innerHeight,
  index = 0,
  onNodeClick,
  onNodeHover,
}) => {
  const [nodes, setNodes] = useState<PosNode[]>([]);
  const [links, setLinks] = useState<{ source: number; target: number }[]>([]);

  useEffect(() => {
    // build a simple graph: center node + its direct children
    const center: PosNode = { ...(data as any), x: width / 2, y: height / 2, r: 30, isCenter: true };
    const children = (data.children || []).map((c, i) => ({ ...(c as any), x: width / 2, y: height / 2, r: 20, isCenter: false }));
    const all: PosNode[] = [center, ...children];
    const linkObjs = children.map((_, i) => ({ source: 0, target: i + 1 }));

    // create d3-force simulation and pre-tick to stable positions
    const simulation = (d3 as any)
      .forceSimulation()
      .nodes(all)
      .force("link", (d3 as any).forceLink(linkObjs).distance(90).strength(0.6))
      .force("center", (d3 as any).forceCenter(width / 2, height / 2))
      .force("charge", (d3 as any).forceManyBody().strength(-120))
      .force("collide", (d3 as any).forceCollide((d: any) => (d.r || 20) + 6))
      .stop();

    // pre-tick to convergence (same approach as the sample)
    const nTicks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
    for (let i = 0; i < nTicks; ++i) simulation.tick();

    // copy positions into state (clone to break d3 refs)
    const positioned = all.map((a) => ({ ...a }));
    setNodes(positioned);
    setLinks(linkObjs.map((l) => ({ ...l })));

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  const handleMouseOver = (e: React.MouseEvent, node: PosNode) => {
    if (onNodeHover) onNodeHover(node, e.nativeEvent);
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    if (onNodeHover) onNodeHover(null, e.nativeEvent);
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <g>
        {links.map((l, i) => {
          const s = nodes[l.source];
          const t = nodes[l.target];
          if (!s || !t) return null;
          return (
            <line
              key={`link-${i}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke="#94a3b8"
              strokeWidth={1.2}
            />
          );
        })}

        {nodes.map((n, i) => (
          <g key={`node-${i}`} transform={`translate(${n.x},${n.y})`}>
            <circle
              r={n.isCenter ? 28 : Math.max(10, Math.min(40, (n.label?.length || 8) * 2))}
              fill={n.isCenter ? "#2563EB" : "#60A5FA"}
              stroke="#1E3A8A"
              strokeWidth={2}
              style={{ cursor: n.children && n.children.length ? "pointer" : "default" }}
              onClick={(e) => onNodeClick && onNodeClick(n as any, !!n.isCenter, index, e.nativeEvent)}
              onMouseOver={(e) => handleMouseOver(e, n)}
              onMouseOut={handleMouseOut}
            />
            <text textAnchor="middle" dy=".35em" fill="white" fontSize={10} pointerEvents="none">
              {n.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default ForceChart;
