import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Dialog, DialogContent } from "../ui/dialog";

interface HierarchyNode {
  id: string;
  label: string;
  value: number;
  proportion: number;
  children?: HierarchyNode[];
  placeholder?: boolean;
}

interface Props {
  data: HierarchyNode;
  fullScreenChart: boolean;
  setFullScreenChart: React.Dispatch<React.SetStateAction<boolean>>;
}

const REQUIRED_LEVEL1 = [
  "Employee",
  "Crew",
  "Airport",
  "Sales",
  "Revenue",
  "Customer",
  "Flight",
  "Aircraft",
  "Cargo",
  "BlueChip",
];

const AutoDrilldownForceGraph: React.FC<Props> = ({
  data,
  fullScreenChart,
  setFullScreenChart,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  // 🧠 Normalize root children (add placeholders if missing)
  const filteredRoot = React.useMemo(() => {
    if (!data || !data.children) return data;

    const existingMap = new Map(
      data.children.map((c) => [c.label.trim().toLowerCase(), c])
    );

    const normalizedChildren = REQUIRED_LEVEL1.map((name) => {
      const match = existingMap.get(name.trim().toLowerCase());
      return (
        match || {
          id: `placeholder-${name.toLowerCase().replace(/\s+/g, "-")}`,
          label: name,
          value: 0,
          proportion: 0,
          children: [],
          placeholder: true,
        }
      );
    });

    return { ...data, children: normalizedChildren };
  }, [data]);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = { id: filteredRoot.id, label: filteredRoot.label };

    const level1 =
      filteredRoot.children?.map((c) => ({
        id: c.id,
        label: c.label,
        parent: root.id,
        children: c.children || [],
        placeholder: c.placeholder,
      })) || [];

    const activeNode = level1[expandedIndex % level1.length];
    const level2 =
      activeNode?.children?.map((c) => ({
        id: c.id,
        label: c.label,
        parent: activeNode.id,
        children: [],
      })) || [];

    const nodes: any[] = [root, ...level1, ...level2];
    const links: any[] = [
      ...level1.map((c) => ({ source: root.id, target: c.id })),
      ...level2.map((c) => ({ source: activeNode.id, target: c.id })),
    ];

    // D3 Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) => (d.source.id === root.id ? 220 : 120))
      )
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(50));

    // Links
    const link = svg
      .append("g")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(links)
      .join("line");

    // Nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) =>
        d.id === root.id ? 50 : level1.find((n) => n.id === d.id) ? 42 : 30
      )
      .attr("fill", (d: any) =>
        d.id === root.id
          ? "#1e88e5"
          : d.placeholder
          ? "#e0e0e0"
          : level1.find((n) => n.id === d.id)
          ? "#26a69a"
          : "#ffb300"
      )
      .attr("stroke", (d: any) => (d.placeholder ? "#999" : "#fff"))
      .attr("stroke-width", (d: any) => (d.placeholder ? 2 : 3))
      .attr("stroke-dasharray", (d: any) => (d.placeholder ? "5,3" : ""))
      .attr("cursor", "pointer");

    // Labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.label)
      .attr("font-size", (d: any) =>
        d.id === root.id ? 18 : level1.find((n) => n.id === d.id) ? 14 : 12
      )
      .attr("fill", (d: any) => (d.placeholder ? "#777" : "#222"))
      .attr("text-anchor", "middle")
      .attr("dy", 5);

    // Tick updates
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });

    // ✨ Smooth outward movement for active L1 node
    simulation.on("end", () => {
      const active = nodes.find((n) => n.id === activeNode.id);
      if (active && active.x && active.y) {
        const cx = width / 2;
        const cy = height / 2;
        const dx = active.x - cx;
        const dy = active.y - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const factor = 1.3; // outward multiplier

        const newX = cx + dx * factor;
        const newY = cy + dy * factor;

        d3.select(svgRef.current)
          .selectAll("circle")
          .filter((d: any) => d.id === activeNode.id)
          .transition()
          .duration(1200)
          .attr("cx", newX)
          .attr("cy", newY)
          .transition()
          .duration(1200)
          .attr("cx", active.x)
          .attr("cy", active.y);
      }
    });

    const interval = setInterval(() => {
      setExpandedIndex((prev) => (prev + 1) % level1.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      simulation.stop();
    };
  }, [expandedIndex, filteredRoot]);

  const onClose = () => {
    setFullScreenChart(false);
  };

  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="min-w-[100%] h-svh">
        <div className="flex flex-col justify-center items-start w-full h-full relative">
          <div className="w-full h-full bg-white relative flex items-center">
            <svg
              ref={svgRef}
              style={{
                width: "100vw",
                height: "100svh",
                background: "#fafafa",
                overflow: "hidden",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoDrilldownForceGraph;
