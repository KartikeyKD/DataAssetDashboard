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

    const level1 = data.children || [];
    
    const rootR = 90;
    const l1R = 70;
    const orbit = Math.min(width, height) * 0.35;
    const angleStep = (2 * Math.PI) / level1.length;

    // Track which nodes have been expanded
    const expandedNodes = new Set<string>();
    let animationComplete = false;

    // Calculate original positions
    const level1Nodes = level1.map((n, i) => ({
      ...n,
      originalX: cx + orbit * Math.cos(i * angleStep - Math.PI / 2),
      originalY: cy + orbit * Math.sin(i * angleStep - Math.PI / 2),
      angle: i * angleStep - Math.PI / 2,
      index: i,
    }));

    const mainGroup = svg.append("g").attr("class", "main-group");

    // Root node (Data Assets)
    const rootGroup = mainGroup.append("g").attr("class", "root-group");
    
    rootGroup
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", rootR)
      .attr("fill", "#1976d2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3);

    rootGroup
      .append("text")
      .attr("x", cx)
      .attr("y", cy + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 22)
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .text(data.label);

    // Level 1 nodes container
    const l1NodesGroup = mainGroup
      .append("g")
      .attr("class", "level1-nodes");

    // Function to render/update Level 1 nodes with their expanded children
    const renderLevel1Nodes = () => {
      // Clear existing nodes
      l1NodesGroup.selectAll("*").remove();

      level1Nodes.forEach((node) => {
        const nodeGroup = l1NodesGroup
          .append("g")
          .attr("class", `node-${node.id}`)
          .attr("transform", `translate(${node.originalX},${node.originalY})`);

        // Main L1 circle
        nodeGroup
          .append("circle")
          .attr("r", l1R * 1.5)
          .attr("fill", "#26a69a")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        nodeGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dy", 5)
          .attr("font-size", 22)
          .attr("font-weight", "800")
          .attr("fill", "#fff")
          .text(node.label);

        // If this node has been expanded, show its children
        if (expandedNodes.has(node.id) && node.children && node.children.length > 0) {
          const childOrbit = l1R * 1.5;
          const childAngleStep = (2 * Math.PI) / node.children.length;

          node.children.forEach((child, j) => {
            const childX = childOrbit * Math.cos(j * childAngleStep - Math.PI / 2);
            const childY = childOrbit * Math.sin(j * childAngleStep - Math.PI / 2);

            const childGroup = nodeGroup.append("g")
              .attr("class", "child-node");

            childGroup
              .append("circle")
              .attr("cx", childX)
              .attr("cy", childY)
              .attr("r", 35)
              .attr("fill", "#ffb300")
              .attr("stroke", "#fff")
              .attr("stroke-width", 1);

            childGroup
              .append("text")
              .attr("x", childX)
              .attr("y", childY + 3)
              .attr("text-anchor", "middle")
              .attr("font-size", 8)
              .attr("font-weight", "500")
              .attr("fill", "#222")
              .text(child.label);
          });
        }

        // Add hover effects only after animation is complete
        if (animationComplete && expandedNodes.has(node.id)) {
          nodeGroup
            .style("cursor", "pointer")
            .on("mouseover", function() {
              d3.select(this)
                .transition()
                .duration(300)
                .attr("z-index", 10000000)
                .attr("transform", `translate(${node.originalX},${node.originalY}) scale(2)`);
            })
            .on("mouseout", function() {
              d3.select(this)
                .transition()
                .duration(300)
                .attr("transform", `translate(${node.originalX},${node.originalY}) scale(1)`);
            });
        }
      });
    };

    // Initial render
    renderLevel1Nodes();

    let currentIndex = 0;

    const animateNextNode = () => {
      if (currentIndex >= level1Nodes.length) {
        // All nodes have been animated, restore to full screen
        console.log("All animations complete, restoring to full screen");
        mainGroup
          .transition()
          .duration(1500)
          .attr("transform", "translate(0, 0) scale(1)")
          .on("end", () => {
            console.log("Restored to full screen center");
            animationComplete = true;
            renderLevel1Nodes(); // Re-render with hover effects enabled
          });
        return;
      }

      const node = level1Nodes[currentIndex];
      const children = node.children || [];

      // Step 1: Shrink entire main group to left
      mainGroup
        .transition()
        .duration(1000)
        .attr("transform", `translate(${-width * 0.1}, 0) scale(0.5)`);

      setTimeout(() => {
        // Step 2: Create clone that travels from original position to center
        const travelGroup = svg
          .append("g")
          .attr("class", `travel-${node.id}`);

        // Start from the node's position in the shrunken main group
        const startX = cx - width * 0.1 * 0.5 + (node.originalX - cx) * 0.5;
        const startY = cy + (node.originalY - cy) * 0.5;

        travelGroup
          .append("circle")
          .attr("cx", startX)
          .attr("cy", startY)
          .attr("r", l1R * 0.7)
          .attr("fill", "#26a69a")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        const travelText = travelGroup
          .append("text")
          .attr("x", startX)
          .attr("y", startY + 3)
          .attr("text-anchor", "middle")
          .attr("font-size", 16)
          .attr("font-weight", "500")
          .attr("fill", "#fff")
          .text(node.label);

        // Animate to center and expand
        travelGroup
          .select("circle")
          .transition()
          .duration(1000)
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 100);

        travelText
          .transition()
          .duration(1000)
          .attr("x", cx)
          .attr("y", cy + 5)
          .attr("font-size", 24);

        // Step 3: Expand children after center node is in place
        if (children.length > 0) {
          setTimeout(() => {
            const childOrbit = Math.min(width, height) * 0.25;
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
              .attr("r", 0)
              .attr("fill", "#ffb300")
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .transition()
              .duration(1000)
              .attr("r", 135)
              .attr("cx", (d) => d.targetX)
              .attr("cy", (d) => d.targetY);

            childGroup
              .append("text")
              .attr("x", cx)
              .attr("y", cy)
              .attr("text-anchor", "middle")
              .attr("dy", 5)
              .attr("font-size", 20)
              .attr("font-weight", "900")
              .attr("fill", "#222")
              .attr("opacity", 0)
              .text((d) => d.label)
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("x", (d) => d.targetX)
              .attr("y", (d) => d.targetY + 5);

            // Mark this node as expanded
            expandedNodes.add(node.id);
            
            // Update the left side chart to show expanded state
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
      // Collapse children first
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

      // Then shrink and move back to original position
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
          .attr("y", startY + 3)
          .attr("font-size", 8)
          .on("end", () => {
            // Remove travel group
            travelGroup.remove();

            // Check if this is the last node
            if (currentIndex === level1Nodes.length - 1) {
              // Last node completed, restore main group to full screen
              mainGroup
                .transition()
                .duration(1500)
                .attr("transform", "translate(0, 0) scale(1)")
                .on("end", () => {
                  console.log("Animation sequence complete - back to full screen");
                  animationComplete = true;
                  renderLevel1Nodes(); // Re-render with hover effects
                });
            } else {
              // Not the last node, continue to next
              currentIndex++;
              setTimeout(animateNextNode, 500);
            }
          });
      }, 800);
    };

    // Start animation sequence
    setTimeout(() => {
      animateNextNode();
    }, 5000);
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
