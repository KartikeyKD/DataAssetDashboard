import React, { useState } from "react";
import { motion } from "framer-motion";
import MetricCard from "./MetricCard"; // adjust import path

export default function MetricGrid({ secondRowMetrics,data }) {
  const [active, setActive] = useState<number | null>(null);

  const getGridPosition = (index: number) => {
    // fixed positions for 2x2 grid
    switch (index) {
      case 0:
        return { gridColumn: "1", gridRow: "1" }; // top-left
      case 1:
        return { gridColumn: "2", gridRow: "1" }; // top-right
      case 2:
        return { gridColumn: "1", gridRow: "2" }; // bottom-left
      case 3:
        return { gridColumn: "2", gridRow: "2" }; // bottom-right
      default:
        return {};
    }
  };

  const getAnimation = (index: number, isActive: boolean) => {
    if (!isActive) return {};

    // Expand toward opposite corners
    switch (index) {
      case 0: // top-left → expand bottom-right
        return { gridColumn: "1 / span 2", gridRow: "1 / span 2" };
      case 1: // top-right → expand bottom-left
        return { gridColumn: "1 / span 2", gridRow: "1 / span 2" };
      case 2: // bottom-left → expand top-right
        return { gridColumn: "1 / span 2", gridRow: "1 / span 2" };
      case 3: // bottom-right → expand top-left
        return { gridColumn: "1 / span 2", gridRow: "1 / span 2" };
      default:
        return {};
    }
  };

  const getTransformOrigin = (index: number, isActive: boolean) => {
    if (!isActive) return {};

    switch (index) {
      case 0:
        return { originX: 0, originY: 0 }; // expand from top-left
      case 1:
        return { originX: 1, originY: 0 }; // expand from top-right
      case 2:
        return { originX: 0, originY: 1 }; // expand from bottom-left
      case 3:
        return { originX: 1, originY: 1 }; // expand from bottom-right
      default:
        return {};
    }
  };

  return (
    <div
      className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full overflow-hidden"
      style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
    >
      {secondRowMetrics.slice(0, 4).map((metric, index) => {
        const isActive = active === index;

        return (
          <div
            key={index}
            onClick={() => setActive(isActive ? null : index)}
            className={`rounded-2xl overflow-hidden cursor-pointer ${
              isActive ? "z-10" : "z-0"
            } ${!isActive && active !== null ? "opacity-60 scale-95" : "opacity-100"}`}
          >
            <MetricCard
              {...metric}
              active={isActive}
              activeIndex={active}
                index={index}
                data={data}
              className={`h-full w-full transition-all duration-500 ${
                isActive
                  ? "scale-[1.01] shadow-2xl"
                  : "hover:scale-100 hover:shadow-md"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
