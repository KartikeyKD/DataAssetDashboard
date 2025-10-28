import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Dialog, DialogContent } from "../ui/dialog";
import ForceGraph from "./D3Test";

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
  "Aircraft",
  "Airport",
  "BlueChip",
  "Cargo",
  "Crew",
  "Customer",
  "Employee",
  "Flight",
  "Sales",
];

const AutoDrilldownForceGraph: React.FC<Props> = ({
  data,
  fullScreenChart,
  setFullScreenChart,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
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
    setTimeout(() => setChartReady(true), 50);
  }, [fullScreenChart]);

  useEffect(() => {
    if (!chartReady) return;
    
    // Use larger dimensions to accommodate all nodes with children
    const width = 1600;
    const height = 1600;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = { id: filteredRoot.id, label: filteredRoot.label };
    const level1 = filteredRoot.children || [];

    const baseRadius = 160;
    const childRadius = 100;

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
      .attr("r", 60)
      .attr("fill", "#dde2e5ff");

    svg
      .append("text")
      .attr("x", centerX)
      .attr("y", centerY + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 20)
      .attr("font-weight", "bold")
      .attr("fill", "Black")
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
      .attr("r", 55)
      .attr("fill", (d) => (d.placeholder ? "#e0e0e0" : "#5483d0ff"))
      .attr("stroke", (d) => (d.placeholder ? "#999" : "#b8a8a8ff"))
      .attr("stroke-width", (d) => (d.placeholder ? 2 : 3))
      .attr("stroke-dasharray", (d) => (d.placeholder ? "5,3" : ""));

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", 15)
      .attr("font-weight", "bold")
      .attr("fill", (d) => (d.placeholder ? "#777" : "#222"))
      .text((d) => d.label);

    // 🔄 Expand all nodes simultaneously
    level1Positions.forEach((node) => {
      const nodeSel = svg
        .selectAll("g")
        .filter((d: any) => d?.id === node.id);

      // Move the node outward
      const newX = centerX + (baseRadius + 220) * Math.cos(node.angle);
      const newY = centerY + (baseRadius + 220) * Math.sin(node.angle);

      nodeSel.transition().attr("transform", `translate(${newX},${newY})`);

      const children = node.children || [];

      if (children.length === 0) return;

      const arcStart = node.angle - Math.PI / 8;
      const arcEnd = node.angle + Math.PI / 8;
      const angleStep2 = (arcEnd - arcStart);

      const childPositions = children.map((child, j) => {
        const angle = arcStart + j * angleStep2;
        return {
          ...child,
          x: newX + childRadius * Math.cos(angle),
          y: newY + childRadius * Math.sin(angle),
        };
      });

      const group = svg.append("g").selectAll("g").data(childPositions).join("g");

      group
        .append("circle")
        .attr("r", 40)
        .attr("fill", "#c67863b0")
        .attr("cx", newX)
        .attr("cy", newY)
        .attr("opacity", 0)
        .transition()
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("opacity", 1);

      group.each(function (d) {
        const words = d.label.split(/\s+/);
        const maxLineLength = 10;
        const lines: string[] = [];
        let currentLine = "";

        words.forEach((word) => {
          if ((currentLine + " " + word).trim().length <= maxLineLength) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine.trim());
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine.trim());

        const text = d3
          .select(this)
          .append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("fill", "#222")
          .attr("font-weight", "bold")
          .attr("opacity", 0);

        lines.forEach((line, i) => {
          text
            .append("tspan")
            .text(line)
            .attr("x", d.x)
            .attr("y", d.y + i * 13 - ((lines.length - 1) * 13) / 2);
        });

        text.transition().attr("opacity", 1);
      });
    });
  }, [chartReady, filteredRoot]);

  const onClose = () => {
    setChartReady(false);
    setFullScreenChart(false);
  };

  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen p-0 m-0 max-w-none overflow-y-auto overflow-x-hidden">
        {/* <div className="flex flex-col justify-center items-center w-full h-full min-w-[1600px] min-h-[1600px]">
          <svg
            ref={svgRef}
            width={1600}
            height={1600}
            style={{
              background: "#fafafa",
            }}
          />
        </div> */}


        <ForceGraph/>
      </DialogContent>
    </Dialog>
  );
};

export default AutoDrilldownForceGraph;
