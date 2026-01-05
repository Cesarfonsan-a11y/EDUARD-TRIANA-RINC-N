
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ActorNode, RelationLink } from '../types.ts';

interface Props {
  nodes: ActorNode[];
  links: RelationLink[];
  onNodeClick: (node: ActorNode) => void;
}

const NetworkGraph: React.FC<Props> = ({ nodes, links, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation<any>(nodes)
      .force('link', d3.forceLink<any, any>(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        if (d.type === 'PRIMARY_FLOW') return '#0ea5e9'; 
        if (d.type === 'SECONDARY_FLOW') return '#94a3b8'; 
        return '#facc15'; 
      })
      .attr('stroke-dasharray', d => d.type === 'VOTING_INFLUENCE' ? '5,5' : 'none')
      .attr('stroke-width', d => d.type === 'PRIMARY_FLOW' ? 4 : 2)
      .attr('opacity', 0.6);

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => {
        if (d.category === 'CORE') return 25;
        if (d.category === 'POLITICAL') return 35;
        return 18;
      })
      .attr('fill', d => {
        if (d.category === 'CORE') return '#1e3a8a'; 
        if (d.category === 'SUPPLIER') return '#0ea5e9'; 
        if (d.category === 'CONSUMPTION') return '#f8fafc';
        if (d.category === 'PROFESSIONAL') return '#10b981'; // Emerald 500 para Profesionales
        return '#facc15'; 
      })
      .attr('stroke', '#334155')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick(d as ActorNode))
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', 38);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y);

      label
        .attr('x', d => (d as any).x)
        .attr('y', d => (d as any).y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, links, onNodeClick]);

  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 h-[450px]">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
        <i className="fa-solid fa-network-wired text-sky-400"></i>
        Ecosistema de Influencia Electoral
      </h3>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div className="flex gap-4 mt-2 text-[10px] text-slate-400 overflow-x-auto pb-2 whitespace-nowrap scrollbar-hide">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-900 rounded-full"></span> Núcleo</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-500 rounded-full"></span> Proveedores</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white rounded-full"></span> Comercio</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Profesionales</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-full"></span> Triana 102</span>
      </div>
    </div>
  );
};

export default NetworkGraph;
