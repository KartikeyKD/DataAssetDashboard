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

const AutoDrilldownForceGraph: React.FC<Props> = ({
  data,
  fullScreenChart,
  setFullScreenChart,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (!fullScreenChart) return;
    setTimeout(() => setChartReady(true), 200);
  }, [fullScreenChart]);

  useEffect(() => {
    if (!chartReady || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const cx = width / 2;
    const cy = height / 2;

    // 🔹 Responsive scaling factors
    const scaleFactor = Math.min(width, height) / 1200; // 1.0 at 1200px, scales down on smaller screens

    const rootR = 90 * scaleFactor;
    const l1R = 70 * scaleFactor;
    const childR = 50*scaleFactor;
    const orbit = Math.min(width, height) * 0.35 * scaleFactor * 1.65
    const angleStep = (2 * Math.PI) / (data.children?.length || 1);

    const level1 = data.children || [];
    const expandedNodes = new Set<string>();
    let animationComplete = false;

    const level1Nodes = level1.map((n, i) => ({
      ...n,
      originalX: cx + orbit * Math.cos(i * angleStep - Math.PI / 2),
      originalY: cy + orbit * Math.sin(i * angleStep - Math.PI / 2),
      angle: i * angleStep - Math.PI / 2,
      index: i,
    }));

    const mainGroup = svg.append("g").attr("class", "main-group");

    // 🔹 Root node
    const rootGroup = mainGroup.append("g").attr("class", "root-group");

    rootGroup
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", rootR)
      .attr("fill", "#1976d2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3 * scaleFactor);

    rootGroup
      .append("text")
      .attr("x", cx)
      .attr("y", cy + 5 * scaleFactor)
      .attr("text-anchor", "middle")
      .attr("font-size", 22 * scaleFactor)
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .text(data.label);

    const l1NodesGroup = mainGroup.append("g").attr("class", "level1-nodes");

    const renderLevel1Nodes = () => {
      l1NodesGroup.selectAll("*").remove();

      level1Nodes.forEach((node) => {
        const nodeGroup = l1NodesGroup
          .append("g")
          .attr("class", `node-${node.id}`)
          .attr("transform", `translate(${node.originalX},${node.originalY})`);

        nodeGroup
          .append("circle")
          .attr("r", l1R * 1)
          .attr("fill", "#26a69a")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2 * scaleFactor);

        nodeGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dy", 5 * scaleFactor)
          .attr("font-size", 22 * scaleFactor)
          .attr("font-weight", "800")
          .attr("fill", "#fff")
          .text(node.label);

        if (expandedNodes.has(node.id) && node.children && node.children.length > 0) {
          const childOrbit = l1R * 1.5;
          const childAngleStep = (2 * Math.PI) / node.children.length;

          node.children.forEach((child, j) => {
            const childX = childOrbit * Math.cos(j * childAngleStep - Math.PI / 2);
            const childY = childOrbit * Math.sin(j * childAngleStep - Math.PI / 2);

            const childGroup = nodeGroup.append("g").attr("class", "child-node");

            childGroup
              .append("circle")
              .attr("cx", childX)
              .attr("cy", childY)
              .attr("r", childR)
              .attr("fill", "#ffb300")
              .attr("stroke", "#fff")
              .attr("stroke-width", 1.5 * scaleFactor);

            childGroup
              .append("text")
              .attr("x", childX)
              .attr("y", childY + 3 * scaleFactor)
              .attr("text-anchor", "middle")
              .attr("font-size", 10 * scaleFactor)
              .attr("font-weight", "500")
              .attr("fill", "#222")
              .text(child.label);
          });
        }

        if (animationComplete && expandedNodes.has(node.id)) {
          nodeGroup
            .style("cursor", "pointer")
            .on("mouseover", function () {
              d3.select(this).raise();
              d3.select(this)
                .transition()
                .duration(300)
                .attr(
                  "transform",
                  `translate(${node.originalX},${node.originalY}) scale(1.8)`
                );
            })
            .on("mouseout", function () {
              d3.select(this)
                .transition()
                .duration(300)
                .attr(
                  "transform",
                  `translate(${node.originalX},${node.originalY}) scale(1)`
                );
            });
        }
      });
    };

    renderLevel1Nodes();

    let currentIndex = 0;

    const animateNextNode = () => {
      if (currentIndex >= level1Nodes.length) {
        mainGroup
          .transition()
          .duration(1500)
          .attr("transform", "translate(0, 0) scale(1)")
          .on("end", () => {
            animationComplete = true;
            renderLevel1Nodes();
          });
        return;
      }

      const node = level1Nodes[currentIndex];
      const children = node.children || [];

      mainGroup
        .transition()
        .duration(1000)
        .attr("transform", `translate(${-width * 0.1}, 0) scale(0.5)`);

      setTimeout(() => {
        const travelGroup = svg.append("g").attr("class", `travel-${node.id}`);

        const startX = cx - width * 0.1 * 0.5 + (node.originalX - cx) * 0.5;
        const startY = cy + (node.originalY - cy) * 0.5;

        travelGroup
          .append("circle")
          .attr("cx", startX)
          .attr("cy", startY)
          .attr("r", l1R * 5)
          .attr("fill", "#26a69a")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2 * scaleFactor);

        const travelText = travelGroup
          .append("text")
          .attr("x", startX)
          .attr("y", startY + 3 * scaleFactor)
          .attr("text-anchor", "middle")
          .attr("font-size", 16 * scaleFactor)
          .attr("font-weight", "500")
          .attr("fill", "#fff")
          .text(node.label);

        travelGroup
          .select("circle")
          .transition()
          .duration(1000)
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 100 * scaleFactor);

        travelText
          .transition()
          .duration(1000)
          .attr("x", cx)
          .attr("y", cy + 5 * scaleFactor)
          .attr("font-size", 24 * scaleFactor);

        if (children.length > 0) {
          setTimeout(() => {
            const childOrbit = Math.min(width, height) * 0.35 * scaleFactor;
            const childAngleStep = (2 * Math.PI) / children.length;

            const childNodes = children.map((c, j) => ({
              ...c,
              targetX: cx + childOrbit * Math.cos(j * childAngleStep - Math.PI / 2),
              targetY: cy + childOrbit * Math.sin(j * childAngleStep - Math.PI / 2),
            }));

            const childGroup = travelGroup
              .append("g")
              .attr("class", "children-group")
              .selectAll("g")
              .data(childNodes)
              .join("g");

            childGroup
              .append("circle")
              .attr("cx", cx)
              .attr("cy", cy)
              .attr("fill", "#ffb300")
              .attr("stroke", "#fff")
              .attr("stroke-width", 2 * scaleFactor)
              .transition()
              .duration(1000)
              .attr("r", 130 * scaleFactor)
              .attr("cx", (d) => d.targetX)
              .attr("cy", (d) => d.targetY);

            childGroup
              .append("text")
              .attr("x", cx)
              .attr("y", cy)
              .attr("text-anchor", "middle")
              .attr("dy", 5 * scaleFactor)
              .attr("font-size", 20 * scaleFactor)
              .attr("font-weight", "900")
              .attr("fill", "#222")
              .attr("opacity", 0)
              .text((d) => d.label)
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("x", (d) => d.targetX)
              .attr("y", (d) => d.targetY + 5 * scaleFactor);

            expandedNodes.add(node.id);
            renderLevel1Nodes();

            setTimeout(() => {
              shrinkAndReturn(travelGroup, node, startX, startY);
            }, 5000);
          }, 1000);
        } else {
          setTimeout(() => {
            shrinkAndReturn(travelGroup, node, startX, startY);
          }, 5000);
        }
      }, 1000);
    };

    const shrinkAndReturn = (
      travelGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
      node: typeof level1Nodes[0],
      startX: number,
      startY: number
    ) => {
      travelGroup
        .selectAll(".children-group circle")
        .transition()
        .duration(800)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 0);

      travelGroup
        .selectAll(".children-group text")
        .transition()
        .duration(800)
        .attr("opacity", 0)
        .attr("x", cx)
        .attr("y", cy);

      setTimeout(() => {
        travelGroup
          .select("circle")
          .transition()
          .duration(1000)
          .attr("cx", startX)
          .attr("cy", startY)
          .attr("r", l1R * 0.5);

        travelGroup
          .select("text")
          .transition()
          .duration(1000)
          .attr("x", startX)
          .attr("y", startY + 3 * scaleFactor)
          .attr("font-size", 8 * scaleFactor)
          .on("end", () => {
            travelGroup.remove();

            if (currentIndex === level1Nodes.length - 1) {
              mainGroup
                .transition()
                .duration(1500)
                .attr("transform", "translate(0, 0) scale(1)")
                .on("end", () => {
                  animationComplete = true;
                  renderLevel1Nodes();
                });
            } else {
              currentIndex++;
              setTimeout(animateNextNode, 500);
            }
          });
      }, 800);
    };

    setTimeout(() => {
      animateNextNode();
    }, 5000);

    // 🔹 Redraw on window resize
    const handleResize = () => {
      svg.selectAll("*").remove();
      setChartReady(false);
      setTimeout(() => setChartReady(true), 100);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartReady, data]);

  const onClose = () => {
    setChartReady(false);
    setFullScreenChart(false);
  };

  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="min-w-[100%] h-svh">
        <div className="flex justify-center items-center w-full h-full relative">
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
