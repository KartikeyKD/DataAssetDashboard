import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {data} from './graphData'

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  nodeId: string;
  group: string;
  value: number;
  cluster: string;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

interface ForceGraphProps {
  width?: number;
  height?: number;
}



const ForceGraph: React.FC<ForceGraphProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.18);
  const [showSubcategories, setShowSubcategories] = useState(true);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    const clusterColors: { [key: string]: { dark: string; light: string } } = {
      "root": { dark: "#212529", light: "#212529" },
      "l1-Airport": { dark: "#0d6efd", light: "#cfe2ff" },
      "l1-Aircraft": { dark: "#6610f2", light: "#e0cffc" },
      "l1-Bluechip": { dark: "#6f42c1", light: "#e2d9f3" },
      "l1-Cargo": { dark: "#d63384", light: "#f7d6e6" },
      "l1-Crew": { dark: "#dc3545", light: "#f8d7da" },
      "l1-Customer": { dark: "#fd7e14", light: "#ffe5d0" },
      "l1-Employee": { dark: "#ffc107", light: "#fff3cd" },
      "l1-Flight": { dark: "#209326", light: "#d2e9d4" },
      "l1-Sales": { dark: "#20c997", light: "#d2f4ea" },
    };

    const getColorByNode = (node: Node) => {
      const colors = clusterColors[node.cluster];
      if (!colors) return "#6c757d";
      
      if (node.group === "Root" || node.group === "Category") {
        return colors.dark;
      } else {
        return colors.light;
      }
    };

    const categoryNodes = nodes.filter(n => n.group === "Category");
    
    const subcategoryCount = new Map<string, number>();
    categoryNodes.forEach(cat => {
      const count = links.filter(l => {
        const source = typeof l.source === 'string' ? l.source : l.source.id;
        return source === cat.id;
      }).length;
      subcategoryCount.set(cat.id, count);
    });

    const innerCategories = categoryNodes.filter(n => (subcategoryCount.get(n.id) || 0) < 5);
    const outerCategories = categoryNodes.filter(n => (subcategoryCount.get(n.id) || 0) >= 5);

    const categoryPositions = new Map<string, { x: number; y: number }>();
    
    const innerRadius = Math.min(containerWidth, containerHeight) * 0.2;
    const outerRadius = Math.min(containerWidth, containerHeight) * 0.42;

    innerCategories.forEach((node, i) => {
      const angle = (i / innerCategories.length) * 1.58 * Math.PI - Math.PI ;
      categoryPositions.set(node.id, {
        x: innerRadius * Math.cos(angle),
        y: innerRadius * Math.sin(angle)
      });
    });

    const starPositions = [
      { x: outerRadius , y: -outerRadius + 300 }, //Customer
      { x: 100, y: outerRadius -100 }, //Employee
      { x: -outerRadius + 200, y: outerRadius - 100 }, //Crew
      { x: outerRadius + 150, y: outerRadius - 200 }, //Sales
      { x: -outerRadius, y: -outerRadius + 139 }, //Flight
    ];

    outerCategories.forEach((node, i) => {
      const pos = starPositions[i % starPositions.length];
      categoryPositions.set(node.id, pos);
    });

    function radialForce() {
      let nodes: Node[];
      const strength = 0.9;

      function force(alpha: number) {
        nodes.forEach(node => {
          let targetX = 0;
          let targetY = 0;

          if (node.group === "Root") {
            targetX = 0;
            targetY = 0;
          } else if (node.group === "Category") {
            const pos = categoryPositions.get(node.id);
            if (pos) {
              targetX = pos.x;
              targetY = pos.y;
            }
          } else if (node.group === "Subcategory") {
            const link = links.find(l => {
              const target = typeof l.target === 'object' ? l.target.id : l.target;
              return target === node.id;
            });
            
            if (link) {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
              const parentPos = categoryPositions.get(sourceId);
              
              if (parentPos) {
                if (!showSubcategories) {
                  // Collapse to parent position
                  targetX = parentPos.x;
                  targetY = parentPos.y;
                } else {
                  const siblings = nodes.filter(n => 
                    n.group === "Subcategory" && 
                    links.some(l => {
                      const lSource = typeof l.source === 'object' ? l.source.id : l.source;
                      const lTarget = typeof l.target === 'object' ? l.target.id : l.target;
                      return lSource === sourceId && lTarget === n.id;
                    })
                  );
                  
                  const siblingIndex = siblings.findIndex(s => s.id === node.id);
                  const numSiblings = siblings.length;
                  
                  const subRadius = innerRadius * 0.25;
                  const nodeRadius = 38;
                  const circumference = 2 * Math.PI * subRadius;
                  const nodeSpacing = (nodeRadius * 2 + 8);
                  
                  const angularWidthPerNode = (nodeSpacing / circumference) * 2 * Math.PI;
                  const totalArc = angularWidthPerNode * numSiblings;
                  const arcSpan = Math.min(totalArc, Math.PI);
                  const startAngle = -arcSpan / 2;
                  
                  let angle;
                  if (arcSpan >= 2 * Math.PI) {
                    angle = (siblingIndex / numSiblings) * 2.5 * Math.PI;
                  } else {
                    angle = startAngle + (siblingIndex * angularWidthPerNode) + (angularWidthPerNode / 2);
                  }
                  
                  const parentAngle = Math.atan2(parentPos.y, parentPos.x);
                  
                  targetX = parentPos.x + subRadius * Math.cos(parentAngle + angle);
                  targetY = parentPos.y + subRadius * Math.sin(parentAngle + angle);
                }
              }
            }
          }
//@ts-expect-error
          const dx = targetX - (node.x || 0);
          //@ts-expect-error
          const dy = targetY - (node.y || 0);
          //@ts-expect-error
          node.vx! += dx * strength * alpha;
          //@ts-expect-error
          node.vy! += dy * strength * alpha;
        });
      }

      force.initialize = (_: Node[]) => (nodes = _);
      return force;
    }

    const scale = Math.min(containerWidth, containerHeight) / 1200;

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("radial", radialForce())
      .force("link", d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(60 * scale)
        .strength(0.08))
      .force("charge", d3.forceManyBody().strength(-120 * scale))
      .force("collision", d3.forceCollide()
        .radius(d => {
          if (d.group === "Root") return 85 * scale;
          if (d.group === "Category") return 60 * scale;
          return showSubcategories ? 42 * scale : 5 * scale;
        })
        .strength(0.9));

    simulationRef.current = simulation;

    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("style", "max-width: 100%; max-height: 100%; background: #f8f9fa;");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .translateExtent([
        [-containerWidth * 2, -containerHeight * 2],
        [containerWidth * 2, containerHeight * 2]
      ])
      .on("zoom", (event) => {
        const transform = event.transform;
        
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        g.attr("transform", 
          `translate(${centerX + transform.x}, ${centerY + transform.y}) scale(${transform.k})`
        );
        
        setZoomLevel(transform.k);
      });

    zoomRef.current = zoom;

    svg.call(zoom);

    const g = svg.append("g");

    const initialTransform = d3.zoomIdentity.scale(1.18);
    svg.call(zoom.transform, initialTransform);

    const link = g.append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, Link>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#adb5bd")
      .attr("stroke-opacity", showSubcategories ? 0.3 : d => {
        const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
        return target && target.group === "Subcategory" ? 0 : 0.3;
      })
      .attr("stroke-width", 1.5);

    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, Node>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .style("opacity", d => !showSubcategories && d.group === "Subcategory" ? 0 : 1);

    nodeGroup.append("circle")
      .attr("r", d => {
        if (d.group === "Root") return 85 * scale;
        if (d.group === "Category") return 55 * scale;
        return 38 * scale;
      })
      .attr("fill", d => getColorByNode(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.4))");

    function wrapText(text: d3.Selection<SVGTextElement, Node, SVGGElement, unknown>, maxWidth: number) {
      text.each(function(d) {
        const textEl = d3.select(this);
        const words = d.id.split(/\s+/).reverse();
        let word;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = textEl.attr("y");
        const dy = 0;
        let tspan = textEl.text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em");

        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          const node = tspan.node();
          if (node && node.getComputedTextLength() > maxWidth) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = textEl.append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }

        const numLines = textEl.selectAll("tspan").size();
        const offset = -(numLines - 1) * lineHeight / 2;
        textEl.selectAll("tspan").attr("dy", (d, i) => (i * lineHeight + offset) + "em");
      });
    }

    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 2.5 * scale)
      .attr("font-size", d => {
        if (d.group === "Root") return `${25 * scale}px`;
        if (d.group === "Category") return `${12 * scale}px`;
        return `${9 * scale}px`;
      })
      .attr("fill", d => {
        if (d.group === "Root" || d.group === "Category") {
          return "#fff";
        } else {
          return "#212529";
        }
      })
      .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .attr("font-weight", d => d.group === "Root" ? "700" : d.group === "Category" ? "600" : "500")
      .style("pointer-events", "none")
      .style("text-shadow", d => {
        if (d.group === "Root" || d.group === "Category") {
          return "0px 1px 2px rgba(0,0,0,0.3)";
        }
        return "none";
      })
      .call(function(selection) {
        selection.each(function(d) {
          const maxWidth = (d.group === "Root" ? 140 : d.group === "Category" ? 95 : 68) * scale;
          wrapText(d3.select(this), maxWidth);
        });
      });

    nodeGroup.append("title")
      .text(d => `${d.id}\nValue: ${d.value.toLocaleString()}`);

    nodeGroup
      .on("mouseenter", function() {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("stroke-width", 5)
          .attr("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.4))");
      })
      .on("mouseleave", function() {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("stroke-width", 3)
          .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))");
      });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    nodeGroup.call(
      d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    simulation.on("tick", () => {
      link
      //@ts-expect-error
        .attr("x1", d => (d.source as Node).x!)
        //@ts-expect-error
        .attr("y1", d => (d.source as Node).y!)
        //@ts-expect-error
        .attr("x2", d => (d.target as Node).x!)
        //@ts-expect-error
        .attr("y2", d => (d.target as Node).y!);

      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [showSubcategories]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      const resetTransform = d3.zoomIdentity.scale(1.18);
      
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, resetTransform);
    }
  };

  const handleToggleSubcategories = () => {
    setShowSubcategories(!showSubcategories);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        position: 'relative'
      }}
    >
      <svg ref={svgRef} />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: '2px solid #6610f2',
            backgroundColor: '#ffffff',
            color: '#6610f2',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6610f2';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#6610f2';
          }}
          title="Zoom In"
        >
          +
        </button>
        
        <button
          onClick={handleZoomOut}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: '2px solid #6610f2',
            backgroundColor: '#ffffff',
            color: '#6610f2',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6610f2';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#6610f2';
          }}
          title="Zoom Out"
        >
          −
        </button>
        
        <button
          onClick={handleReset}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: '2px solid #6610f2',
            backgroundColor: '#ffffff',
            color: '#6610f2',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6610f2';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#6610f2';
          }}
          title="Reset View"
        >
          ⟲
        </button>

        <button
          onClick={handleToggleSubcategories}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            border: '2px solid #209326',
            backgroundColor: showSubcategories ? '#209326' : '#ffffff',
            color: showSubcategories ? '#ffffff' : '#209326',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (showSubcategories) {
              e.currentTarget.style.backgroundColor = '#1a7a1f';
            } else {
              e.currentTarget.style.backgroundColor = '#209326';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (showSubcategories) {
              e.currentTarget.style.backgroundColor = '#209326';
            } else {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#209326';
            }
          }}
          title={showSubcategories ? "Collapse Subcategories" : "Expand Subcategories"}
        >
          {showSubcategories ? '◉' : '○'}
        </button>
        
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          border: '2px solid #dee2e6',
          fontSize: '12px',
          fontWeight: '600',
          color: '#6610f2',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>
    </div>
  );
};

export default ForceGraph;
