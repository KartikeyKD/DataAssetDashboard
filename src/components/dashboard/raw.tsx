


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
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [chartReady, setChartReady] = useState(false);

  // ✅ Normalize Data Assets level
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

  // 🧠 Render chart only when dialog is open
  useEffect(() => {
    if (!fullScreenChart) return;
    setTimeout(() => setChartReady(true), 100); // small delay to ensure dialog mounts
  }, [fullScreenChart]);

  useEffect(() => {
    if (!chartReady) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = { id: filteredRoot.id, label: filteredRoot.label };
    const level1 = filteredRoot.children || [];

    const baseRadius = 100; // distance from root
    const childRadius = 70; // distance from parent for L2 nodes

    const angleStep = (2 * Math.PI) / level1.length;
    const level1Positions = level1.map((node, i) => {
      const angle = i * angleStep;
      return {
        ...node,
        x: centerX + baseRadius * Math.cos(angle),
        y: centerY + baseRadius * Math.sin(angle),
        angle,
      };
    });

    // 🟢 Root node
    svg
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 55)
      .attr("fill", "#1e88e5");

    svg
      .append("text")
      .attr("x", centerX)
      .attr("y", centerY + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("fill", "white")
      .text(root.label);

    // 🟡 L1 nodes circularly around root
    const nodeGroup = svg
      .append("g")
      .selectAll("g")
      .data(level1Positions)
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodeGroup
      .append("circle")
      .attr("r", 30)
      .attr("fill", (d) => (d.placeholder ? "#e0e0e0" : "#26a69a"))
      .attr("stroke", (d) => (d.placeholder ? "#999" : "#fff"))
      .attr("stroke-width", (d) => (d.placeholder ? 2 : 3))
      .attr("stroke-dasharray", (d) => (d.placeholder ? "5,3" : ""));

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", 13)
      .attr("fill", (d) => (d.placeholder ? "#777" : "#222"))
      .text((d) => d.label);

    // 🔄 Sequential expansion
    let currentIndex = 0;
    const expandNext = () => {
      if (currentIndex >= level1Positions.length) return;
      const node = level1Positions[currentIndex];
      if (expandedNodes.includes(node.id)) {
        currentIndex++;
        setTimeout(expandNext, 5000);
        return;
      }

      setExpandedNodes((prev) => [...prev, node.id]);

      const nodeSel = svg
        .selectAll("g")
        .filter((d: any) => d?.id === node.id);

      // Move the node outward a bit
      const newX = centerX + (baseRadius + 220) * Math.cos(node.angle);
      const newY = centerY + (baseRadius + 220) * Math.sin(node.angle);

      nodeSel
        .transition()
        .duration(1000)
        .attr("transform", `translate(${newX},${newY})`)
        .on("end", () => {
          const children = node.children || [];

          if (children.length === 0) {
            currentIndex++;
            setTimeout(expandNext, 5000);
            return;
          }

          // 🟠 Position L2 nodes around the *parent node’s new position*
          const angleStep2 = (2 * Math.PI) / children.length;
          const childPositions = children.map((child, j) => {
            const angle = j * angleStep2;
            return {
              ...child,
              x: newX + childRadius * Math.cos(angle),
              y: newY + childRadius * Math.sin(angle),
            };
          });

          // 🟣 Add child nodes
          const group = svg.append("g").selectAll("g").data(childPositions).join("g");

          group
            .append("circle")
.attr("r", 35)            .attr("fill", "#ffb300")
            .attr("cx", (d) => newX)
            .attr("cy", (d) => newY)
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("opacity", 1);

          group
            .append("text")
            .attr("x", (d) => newX)
            .attr("y", (d) => newY)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", "#222")
            .attr("opacity", 0)
            .text((d) => d.label)
            .transition()
            .duration(800)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y + 4)
            .attr("opacity", 1);

          currentIndex++;
          setTimeout(expandNext, 5000);
        });
    };

    setTimeout(expandNext, 2000);
  }, [chartReady, filteredRoot]);

  const onClose = () => {
    setChartReady(false);
    setFullScreenChart(false);
  };

  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="min-w-[100%] h-svh">
        <div className="flex flex-col justify-center items-center w-full h-full relative">
          <svg
            ref={svgRef}
            style={{
              width: "100vw",
              height: "100svh",
              background: "#fafafa",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoDrilldownForceGraph;
