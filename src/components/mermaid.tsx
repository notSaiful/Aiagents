"use client"
import { useEffect, useState } from "react";
import type { MermaidConfig } from "mermaid";
import mermaid from "mermaid";

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "forest",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
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

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
