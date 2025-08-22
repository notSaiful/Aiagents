"use client"
import { useEffect, useState } from "react";
import type { MermaidConfig } from "mermaid";
import mermaid from "mermaid";

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: '#FFFFFF', // white background
    primaryColor: '#FFFFFF', // node background
    primaryTextColor: '#24292e', // dark text for readability
    primaryBorderColor: '#FFB6C1', // pale rose for borders
    lineColor: '#333333', // dark line color
    secondaryColor: '#FFB6C1', // pale rose
    tertiaryColor: '#FFE4E1', // lighter rose
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    // Node-specific styling
    nodeBorder: '#FFB6C1',
    mainBkg: '#FFFFFF',
    // Root node styling
    pieTitleTextSize: '18px',
    pieTitleTextColor: '#24292e',
    // Edge label styling
    edgeLabelBackground: '#FFFFFF',
    // Class styles
    classText: '#24292e',
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
  mindmap: {
    padding: 20,
    maxDepth: 6,
    useMaxWidth: true,
  }
};

interface MermaidProps {
  chart: string;
  config?: MermaidConfig;
}

export default function Mermaid({
  chart,
  config = DEFAULT_CONFIG,
}: MermaidProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize(config);

    const renderMermaid = async () => {
      try {
        // ID generation moved here to avoid server-client mismatch
        const id = `mermaid-graph-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: newSvg } = await mermaid.render(
          id,
          chart
        );
        setSvg(newSvg);
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        // Display an error message in the container if rendering fails
        setSvg('<div class="p-4 text-destructive">Error rendering diagram.</div>');
      }
    };

    renderMermaid();
  }, [chart, config]);
  
  if (!svg) {
    return <div className="p-4 text-muted-foreground">Loading diagram...</div>;
  }
  
  return <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
}