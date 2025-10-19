import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TreeNodeData } from "./TreeNode";
import DrilldownTree from "./DrilldownTree";
import { Dialog, DialogContent } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

interface HybridDrilldownTreeProps {
  data: TreeNodeData;
  title?: string;
  width?: number;
  height?: number;
  fullScreenChart: boolean;
  setFullScreenChart: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PositionedNode extends TreeNodeData {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  isCenter?: boolean;
}

const HybridDrilldownTree: React.FC<HybridDrilldownTreeProps> = ({
  data,
  title,
  fullScreenChart,
  setFullScreenChart,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: Math.floor(window.innerHeight * 0.5),
  });
  const [dialogReady, setDialogReady] = useState(false);

  // 🪟 Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: Math.floor(window.innerHeight * 0.5),
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (fullScreenChart) {
      const timer = setTimeout(() => setDialogReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setDialogReady(false);
    }
  }, [fullScreenChart]);

  // 🧹 Tooltip cleanup
  useEffect(() => {
    const handleOutsideClick = () => {
      d3.selectAll(".analytics-tooltip").remove();
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // 🧭 D3 Force Layout with expanding bubbles
  useEffect(() => {
    if (!dialogReady || !data) return;

    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Shared tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "analytics-tooltip absolute z-50 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl p-4"
      )
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("visibility", "hidden")
      .style("opacity", "0")
      .style("transition", "opacity 0.2s ease");

    // Initial node
    const rootNode: PositionedNode = { ...data, isCenter: true, x: width / 2, y: height / 2 };
    let nodes: PositionedNode[] = [rootNode];
    let links: { source: string; target: string }[] = [];

    const getRadius = (d: PositionedNode) => (d.isCenter ? 30 : 25);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id || d.label)
          .distance(120)
          .strength(0.6)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => getRadius(d) + 4));

    // Draw links
    const linkGroup = g.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6).selectAll("line");

    // Draw nodes
    const nodeGroup = g.append("g").selectAll("circle");
    const labelGroup = g.append("g").selectAll("text");

    const updateGraph = () => {
      // Links
      const linkSel = linkGroup.data(links);
      linkSel
        .enter()
        .append("line")
        .attr("stroke-width", 1.5)
        .merge(linkSel as any);
      linkSel.exit().remove();

      // Nodes
      const nodeSel = nodeGroup.data(nodes, (d: any) => d.id || d.label);
      const nodeEnter = nodeSel
        .enter()
        .append("circle")
        .attr("r", getRadius)
        .attr("fill", (d) => (d.isCenter ? "#2563EB" : "#60A5FA"))
        .attr("stroke", "#1E3A8A")
        .attr("stroke-width", 2)
        .style("cursor", (d) => (d.children ? "pointer" : "default"))
        .on("click", (event, d) => expandNode(d))
        .on("mouseover", function (event, d) {
          d3.select(this).transition().duration(150).attr("r", getRadius(d) + 8);
          // Tooltip content
          let html = "";
          const analytics = d.analytics;
          if (analytics) {
            html = `<div><b>${d.label}</b></div>`;
          } else {
            html = `<div>${d.label}</div>`;
          }
          tooltip.style("visibility", "visible").html(html).style("opacity", "1");
        })
        .on("mousemove", (event) => {
          tooltip.style("left", `${event.pageX + 20}px`).style("top", `${event.pageY - 100}px`);
        })
        .on("mouseout", function (event, d) {
          tooltip.style("visibility", "hidden").style("opacity", "0");
          d3.select(this).transition().duration(150).attr("r", getRadius(d));
        });

      nodeSel.exit().remove();

      // Labels
      const textSel = labelGroup.data(nodes, (d: any) => d.id || d.label);
      textSel
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-size", "10px")
        .style("fill", "white")
        .text((d) => d.label);
      textSel.exit().remove();

      simulation.nodes(nodes);
      (simulation.force("link") as any).links(links);
      simulation.alpha(0.5).restart();
    };

    const expandNode = (node: PositionedNode) => {
      if (!node.children || node.children.length === 0) return;

      const angleStep = (2 * Math.PI) / node.children.length;
      node.children.forEach((child, i) => {
        const angle = i * angleStep;
        const newX = (node.x || width / 2) + Math.cos(angle) * 150;
        const newY = (node.y || height / 2) + Math.sin(angle) * 150;
        const newNode: PositionedNode = {
          ...child,
          x: newX,
          y: newY,
        };
        nodes.push(newNode);
        links.push({ source: node.id || node.label, target: child.id || child.label });
      });

      updateGraph();
    };

    updateGraph();

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [data, dialogReady, dimensions]);

  const onClose = () => {
    setFullScreenChart(false);
  };

  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="min-w-[100%] h-svh">
        <div className="flex flex-col justify-center items-start w-full h-full relative">
          <div
            ref={containerRef}
            className="w-full h-full bg-white relative overflow-hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HybridDrilldownTree;
