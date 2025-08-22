"use client"
import { useEffect, useState } from "react";
import type { MermaidConfig } from "mermaid";
import mermaid from "mermaid";

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: '#F5F5DC', // light beige
    primaryColor: '#E6E6FA', // soft lavender
    primaryTextColor: '#24292e', // dark text for readability
    primaryBorderColor: '#D1C4E9', // slightly darker lavender
    lineColor: '#333333', // dark line color
    secondaryColor: '#FFB6C1', // pale rose
    tertiaryColor: '#FFE4E1', // lighter rose
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    // Node-specific styling
    nodeBorder: '#D1C4E9',
    mainBkg: '#E6E6FA',
    // Root node styling
    pieTitleTextSize: '18px',
    pieTitleTextColor: '#24292e',
    // Edge label styling
    edgeLabelBackground: '#F5F5DC',
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
        const { svg: newSvg } = await mermaid.render(
          `mermaid-graph-${Math.random().toString(36).substring(2, 9)}`,
          chart
        );
        setSvg(newSvg);
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        setSvg(null);
      }
    };

    renderMermaid();
  }, [chart, config]);

  if (!svg) {
    return <div className="p-4 text-muted-foreground">Loading diagram...</div>;
  }

  return <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
}
