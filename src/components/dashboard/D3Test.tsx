import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  nodeId: string;
  group: string;
  value: number;
  cluster: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface ForceGraphProps {
  width?: number;
  height?: number;
}

const data: GraphData = {
  nodes: [
    { id: "Data Assets", nodeId: "root", group: "Root", value: 100000, cluster: "root" },
    { id: "Airport", nodeId: "l1-Airport", group: "Category", value: 1000, cluster: "l1-Airport" },
    { id: "Geography", nodeId: "l2-Airport-Geography", group: "Subcategory", value: 250, cluster: "l1-Airport" },
    { id: "Station Details", nodeId: "l2-Airport-Station Details", group: "Subcategory", value: 250, cluster: "l1-Airport" },
    { id: "Domestic /International", nodeId: "l2-Airport-Domestic/International", group: "Subcategory", value: 250, cluster: "l1-Airport" },
    { id: "Aircraft", nodeId: "l1-Aircraft", group: "Category", value: 1200, cluster: "l1-Aircraft" },
    { id: "Registration", nodeId: "l2-Aircraft-Registration", group: "Subcategory", value: 300, cluster: "l1-Aircraft" },
    { id: "Seating Plan", nodeId: "l2-Aircraft-Seating Plan", group: "Subcategory", value: 300, cluster: "l1-Aircraft" },
    { id: "Aircraft Type", nodeId: "l2-Aircraft-Aircraft Type", group: "Subcategory", value: 300, cluster: "l1-Aircraft" },
    { id: "Utilization", nodeId: "l2-Aircraft-Utilization", group: "Subcategory", value: 300, cluster: "l1-Aircraft" },
    { id: "Customer", nodeId: "l1-Customer", group: "Category", value: 2400, cluster: "l1-Customer" },
    { id: "Customer Profile", nodeId: "l2-Customer-Profile", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Booking History", nodeId: "l2-Customer-Booking History", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Booking Behaviours", nodeId: "l2-Customer-Booking Behaviours", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Hotel Bookings", nodeId: "l2-Customer-Hotel Bookings", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Ancillary Preferences", nodeId: "l2-Customer-Ancillary Preferences", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Customer Experience /NPS", nodeId: "l2-Customer-Customer Experience/NPS", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Booking Channels", nodeId: "l2-Customer-Booking Channels", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Customer Flown", nodeId: "l2-Customer-Customer Flown", group: "Subcategory", value: 300, cluster: "l1-Customer" },
    { id: "Employee", nodeId: "l1-Employee", group: "Category", value: 1250, cluster: "l1-Employee" },
    { id: "Employee Profile", nodeId: "l2-Employee-Profile", group: "Subcategory", value: 250, cluster: "l1-Employee" },
    { id: "Headcount", nodeId: "l2-Employee-Headcount", group: "Subcategory", value: 250, cluster: "l1-Employee" },
    { id: "Attrition", nodeId: "l2-Employee-Attrition", group: "Subcategory", value: 250, cluster: "l1-Employee" },
    { id: "Diversity", nodeId: "l2-Employee-Diversity", group: "Subcategory", value: 250, cluster: "l1-Employee" },
    { id: "Span of Control", nodeId: "l2-Employee-Span of Control", group: "Subcategory", value: 250, cluster: "l1-Employee" },
    { id: "Cargo", nodeId: "l1-Cargo", group: "Category", value: 1000, cluster: "l1-Cargo" },
    { id: "Freighters", nodeId: "l2-Cargo-Freighters", group: "Subcategory", value: 250, cluster: "l1-Cargo" },
    { id: "Category", nodeId: "l2-Cargo-Category", group: "Subcategory", value: 250, cluster: "l1-Cargo" },
    { id: "Cargo Agent Performances", nodeId: "l2-Cargo-Cargo Agent Performances", group: "Subcategory", value: 250, cluster: "l1-Cargo" },
    { id: "Freighter Tonnage /Volumes", nodeId: "l2-Cargo-Freighter Tonnage/Volumes", group: "Subcategory", value: 250, cluster: "l1-Cargo" },
    { id: "Crew", nodeId: "l1-Crew", group: "Category", value: 1250, cluster: "l1-Crew" },
    { id: "Roaster", nodeId: "l2-Crew-Roaster", group: "Subcategory", value: 250, cluster: "l1-Crew" },
    { id: "Block Hours", nodeId: "l2-Crew-Block Hours", group: "Subcategory", value: 250, cluster: "l1-Crew" },
    { id: "Crew Qualification", nodeId: "l2-Crew-Crew Qualification", group: "Subcategory", value: 250, cluster: "l1-Crew" },
    { id: "Crew Base Station", nodeId: "l2-Crew-Crew Base Station", group: "Subcategory", value: 250, cluster: "l1-Crew" },
    { id: "Crew NPS", nodeId: "l2-Crew-Crew NPS", group: "Subcategory", value: 250, cluster: "l1-Crew" },
    { id: "Bluechip", nodeId: "l1-Bluechip", group: "Category", value: 300, cluster: "l1-Bluechip" },
    { id: "Sales", nodeId: "l1-Sales", group: "Category", value: 2250, cluster: "l1-Sales" },
    { id: "Revenue", nodeId: "l2-Sales-Revenue", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Routes", nodeId: "l2-Sales-Routes", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Product Class", nodeId: "l2-Sales-Product Class", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Connections", nodeId: "l2-Sales-Connections", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Cancellations", nodeId: "l2-Sales-Cancellations", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Channel", nodeId: "l2-Sales-Channel", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Baggage Details", nodeId: "l2-Sales-Baggage Details", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Sales Agent Performances", nodeId: "l2-Sales-Sales Agent Performances", group: "Subcategory", value: 250, cluster: "l1-Sales" },
    { id: "Flight", nodeId: "l1-Flight", group: "Category", value: 2000, cluster: "l1-Flight" },
    { id: "Schedules", nodeId: "l2-Flight-Schedules", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "Sectors", nodeId: "l2-Flight-Sectors", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "Codeshare", nodeId: "l2-Flight-Codeshare", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "Network", nodeId: "l2-Flight-Network", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "OTP", nodeId: "l2-Flight-OTP", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "Load Factor", nodeId: "l2-Flight-Load Factor", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "Distruptions", nodeId: "l2-Flight-Distruptions", group: "Subcategory", value: 250, cluster: "l1-Flight" },
    { id: "Flight Block Hours", nodeId: "l2-Flight-Block Hours", group: "Subcategory", value: 250, cluster: "l1-Flight" }
  ],
  links: [
    { source: "Data Assets", target: "Airport", value: 2 },
    { source: "Airport", target: "Geography", value: 2 },
    { source: "Airport", target: "Station Details", value: 2 },
    { source: "Airport", target: "Domestic /International", value: 2 },
    { source: "Data Assets", target: "Aircraft", value: 2 },
    { source: "Aircraft", target: "Registration", value: 2 },
    { source: "Aircraft", target: "Seating Plan", value: 2 },
    { source: "Aircraft", target: "Aircraft Type", value: 2 },
    { source: "Aircraft", target: "Utilization", value: 2 },
    { source: "Data Assets", target: "Customer", value: 2 },
    { source: "Customer", target: "Customer Profile", value: 2 },
    { source: "Customer", target: "Booking History", value: 2 },
    { source: "Customer", target: "Booking Behaviours", value: 2 },
    { source: "Customer", target: "Hotel Bookings", value: 2 },
    { source: "Customer", target: "Ancillary Preferences", value: 2 },
    { source: "Customer", target: "Customer Experience /NPS", value: 2 },
    { source: "Customer", target: "Booking Channels", value: 2 },
    { source: "Customer", target: "Customer Flown", value: 2 },
    { source: "Data Assets", target: "Employee", value: 2 },
    { source: "Employee", target: "Employee Profile", value: 2 },
    { source: "Employee", target: "Headcount", value: 2 },
    { source: "Employee", target: "Attrition", value: 2 },
    { source: "Employee", target: "Diversity", value: 2 },
    { source: "Employee", target: "Span of Control", value: 2 },
    { source: "Data Assets", target: "Cargo", value: 2 },
    { source: "Cargo", target: "Freighters", value: 2 },
    { source: "Cargo", target: "Category", value: 2 },
    { source: "Cargo", target: "Cargo Agent Performances", value: 2 },
    { source: "Cargo", target: "Freighter Tonnage /Volumes", value: 2 },
    { source: "Data Assets", target: "Crew", value: 2 },
    { source: "Crew", target: "Roaster", value: 2 },
    { source: "Crew", target: "Block Hours", value: 2 },
    { source: "Crew", target: "Crew Qualification", value: 2 },
    { source: "Crew", target: "Crew Base Station", value: 2 },
    { source: "Crew", target: "Crew NPS", value: 2 },
    { source: "Data Assets", target: "Bluechip", value: 2 },
    { source: "Data Assets", target: "Sales", value: 2 },
    { source: "Sales", target: "Revenue", value: 2 },
    { source: "Sales", target: "Routes", value: 2 },
    { source: "Sales", target: "Product Class", value: 2 },
    { source: "Sales", target: "Connections", value: 2 },
    { source: "Sales", target: "Cancellations", value: 2 },
    { source: "Sales", target: "Channel", value: 2 },
    { source: "Sales", target: "Baggage Details", value: 2 },
    { source: "Sales", target: "Sales Agent Performances", value: 2 },
    { source: "Data Assets", target: "Flight", value: 2 },
    { source: "Flight", target: "Schedules", value: 2 },
    { source: "Flight", target: "Sectors", value: 2 },
    { source: "Flight", target: "Codeshare", value: 2 },
    { source: "Flight", target: "Network", value: 2 },
    { source: "Flight", target: "OTP", value: 2 },
    { source: "Flight", target: "Load Factor", value: 2 },
    { source: "Flight", target: "Distruptions", value: 2 },
    { source: "Flight", target: "Flight Block Hours", value: 2 }
  ]
};

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

          const dx = targetX - (node.x || 0);
          const dy = targetY - (node.y || 0);
          node.vx! += dx * strength * alpha;
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
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
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
