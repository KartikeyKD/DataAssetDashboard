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
    fullScreenChart:boolean;
setFullScreenChart:any;
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentNode, setCurrentNode] = useState<TreeNodeData>(data);
  const [history, setHistory] = useState<TreeNodeData[]>([]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 🪟 Handle window resizing
  useEffect(() => {
    setFullScreenChart(true)
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setCurrentNode(prev);
      setHistory((h) => h.slice(0, -1));
    }
  };

  const useForceLayout = (currentNode.children?.length || 0) <= 40;

  useEffect(() => {
    if (!useForceLayout || !currentNode) return;

    const { width, height } = dimensions;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Tooltip container (outside SVG for proper positioning)
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
      .style("transition", "opacity 0.2s ease")
      .style("opacity", "0");

    const centerX = width / 2;
    const centerY = height / 2;
    const g = svg.append("g");

    const getRadius = (d: PositionedNode) => {
      const baseRadius = d.isCenter ? 60 : 30;
      const charFactor = 2;
      const maxRadius = 100;
      return Math.min(baseRadius + (d.label?.length || 0) * charFactor, maxRadius);
    };

    const nodes: PositionedNode[] = [
      { ...currentNode, isCenter: true },
      ...(currentNode.children || []).map((child) => ({
        ...child,
        isCenter: false,
      })),
    ];

    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength((d) => (d.isCenter ? -300 : -100)))
      .force("center", d3.forceCenter(centerX, centerY))
      .force("collision", d3.forceCollide().radius((d) => getRadius(d) + 8))
      .force(
        "radial",
        d3.forceRadial(220, centerX, centerY).strength((d) => (d.isCenter ? 0 : 0.6))
      );

    const centerNode = nodes.find((n) => n.isCenter)!;
    centerNode.fx = centerX;
    centerNode.fy = centerY;

    const generateRandomHexColor = () => {
      let randomColor = Math.floor(Math.random() * 16777215);
      let hexColor = randomColor.toString(16);
      hexColor = hexColor.padStart(6, "0");
      return `#${hexColor.toUpperCase()}`;
    };

    // --- Links ---
    const links = g
      .selectAll("line")
      .data(nodes.filter((n) => !n.isCenter))
      .enter()
      .append("line")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.4);

    // --- Circles ---
    const circles = g
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => getRadius(d))
      .attr("fill", (d) => (d.isCenter ? "#2563EB" : generateRandomHexColor()))
      .attr("stroke", "#1E3A8A")
      .attr("stroke-width", 2)
      .style("cursor", (d) => (d.children ? "pointer" : "default"))
      .on("click", (event, d) => {
        if (!d.isCenter && d.children && d.children.length > 0) {
          setHistory((h) => [...h, currentNode]);
          setCurrentNode(d);
        } else if (d.isCenter) {
          handleBack();
        }
      })
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(150).attr("r", getRadius(d) + 8);

        if (d.analytics) {
          const analytics = d.analytics;
          let html = "";

          if (analytics.columnName) {
            // Column-level node
            html = `
              <div class="mb-3">
                <h4 class="text-sm font-semibold text-gray-800 mb-1">${analytics.columnName}</h4>
                <div class="w-full h-px bg-gray-200"></div>
              </div>
              <div class="space-y-2 text-xs">
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-teal-50 rounded p-2">
                    <div class="text-teal-600 font-medium">Schema Name</div>
                    <div class="text-teal-900 font-bold">${analytics.schemaName}</div>
                  </div>
                  <div class="bg-purple-50 rounded p-2">
                    <div class="text-purple-600 font-medium">Table Name</div>
                    <div class="text-purple-900 font-bold">${analytics.tableName}</div>
                  </div>
                </div>
                <div class="bg-emerald-50 rounded p-2">
                  <div class="text-emerald-600 font-medium">Data Type</div>
                  <div class="text-emerald-900 font-bold font-mono">${analytics.dataType}</div>
                </div>
                ${
                  analytics.description
                    ? `<div class="bg-blue-50 rounded p-2">
                        <div class="text-blue-600 font-medium">Business Description</div>
                        <div class="text-blue-900 leading-relaxed mt-1">${analytics.description}</div>
                      </div>`
                    : !analytics.has_description
                    ? `<div class="bg-yellow-50 rounded p-2 border border-yellow-200">
                        <div class="text-yellow-700 font-medium">⚠️ No Business Description</div>
                      </div>`
                    : ""
                }
              </div>
            `;
          } else {
            // Higher-level node (L1/L2/Schema/Table)
            html = `
              <div class="mb-2">
                <div class="text-base font-semibold text-gray-900">${d.label}</div>
                <div class="text-xs text-gray-500">Columns: <b>${d.value ?? 0}</b></div>
                <div class="text-xs text-gray-500">Coverage: <b>${d.proportion ?? 0}%</b></div>
              </div>
            `;
          }

          tooltip
            .html(html)
            .style("visibility", "visible")
            .style("opacity", "1")
            .style("left", `${event.pageX + 20}px`)
            .style("top", `${event.pageY - 100}px`);
        }
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 20}px`)
          .style("top", `${event.pageY - 100}px`);
      })
      .on("mouseout", function (event, d) {
        tooltip.style("visibility", "hidden").style("opacity", "0");
        d3.select(this).transition().duration(150).attr("r", getRadius(d));
      });

    // --- Labels ---
    const labels = g
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("fill", "white")
      .style("pointer-events", "none")
      .style("font-size", "10px")
      .text((d) => d.label);

    simulation.on("tick", () => {
      circles.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      links.attr("x1", centerX).attr("y1", centerY).attr("x2", (d) => d.x!).attr("y2", (d) => d.y!);
    });

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [currentNode, useForceLayout, dimensions]);
const onClose=()=>{
  setFullScreenChart(false);
}
  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="min-w-[100%] h-svh">
        <div className="flex flex-col justify-center items-start w-full h-full">
          {history.length > 0 && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-900 transition"
            >
              Back
            </button>
          )}

          {useForceLayout ? (
            <div className="w-screen h-screen bg-white flex justify-center items-center">
              <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
              />
            </div>
          ) : (
            <ScrollArea>
              <DrilldownTree
                title=""
                data={currentNode}
                className="bg-transparent min-w-full"
                alignLevelsSingleRow={true}
              />
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HybridDrilldownTree;
