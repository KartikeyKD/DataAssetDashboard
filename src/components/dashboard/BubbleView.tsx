import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ForceChart from "./ForceChart";
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

  console.log(data)
  // If the root node is "Data Asset", restrict its initial level-1 children to this allowed list
  const allowedLevel1 = new Set([
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
  ].map((s) => s.toLowerCase()));

  const getInitialRoot = (): TreeNodeData => {
    if (typeof data.label === "string" && data.label.toLowerCase().includes("data asset")) {
      const filteredChildren = (data.children || []).filter((c) => {
        const lbl = (c.label || "").toString().trim().toLowerCase();
        return allowedLevel1.has(lbl);
      });
      return { ...data, children: filteredChildren };
    }
    return data;
  };

  const [activeNodes, setActiveNodes] = useState<TreeNodeData[]>([getInitialRoot()]);
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

  // We'll render one ForceChart per active node (React + pre-ticked d3-force)
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ""; // keep container clean; ForceChart renders via React into container children
  }, [activeNodes, dimensions]);

  const onClose = () => {
    setFullScreenChart(false);
  };

  return (
    <Dialog open={fullScreenChart} onOpenChange={onClose}>
      <DialogContent className="min-w-[100%] h-svh">
        <div className="flex flex-col justify-center items-start w-full h-full relative">
          <div
            ref={containerRef}
            className="w-full h-full bg-white relative overflow-x-auto flex items-center space-x-6 px-4 py-6"
          >
            {activeNodes.map((node, i) => (
              <div key={`chart-${i}`} style={{ minWidth: Math.floor(dimensions.width / activeNodes.length), height: dimensions.height }}>
                <ForceChart
                  data={node}
                  width={Math.floor(dimensions.width / activeNodes.length)}
                  height={dimensions.height}
                  index={i}
                  onNodeClick={(n, isCenter) => {
                    if (!isCenter && n.children && n.children.length) {
                      const clone: TreeNodeData = JSON.parse(JSON.stringify(n));
                      clone.children = clone.children || [];
                      setActiveNodes((arr) => [...arr, clone]);
                    } else if (isCenter && i > 0) {
                      setActiveNodes((arr) => arr.slice(0, -1));
                    }
                  }}
                  onNodeHover={(n, ev) => {
                    // simple tooltip: create/remove tooltip element
                    d3.selectAll('.analytics-tooltip').remove();
                    if (!n) return;
                    const tooltip = d3.select('body').append('div').attr('class','analytics-tooltip absolute z-50 w-[20rem] bg-white border border-gray-200 rounded-lg shadow-xl p-3');
                    tooltip.html(`<div class="text-sm font-semibold">${(n as any).label}</div>`).style('position','absolute').style('left', `${(ev as any).pageX + 12}px`).style('top', `${(ev as any).pageY - 80}px`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HybridDrilldownTree;
