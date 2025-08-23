
"use client"
import { useEffect, useState } from "react";
import type { MermaidConfig } from "mermaid";
import mermaid from "mermaid";

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: 'var(--background)',
    primaryColor: 'var(--background)',
    primaryTextColor: 'var(--foreground)',
    primaryBorderColor: 'var(--primary)',
    lineColor: 'var(--foreground)',
    secondaryColor: 'var(--primary)',
    tertiaryColor: 'var(--primary)',
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    nodeBorder: 'var(--primary)',
    mainBkg: 'var(--primary)',
    pieTitleTextSize: '18px',
    pieTitleTextColor: 'var(--foreground)',
    edgeLabelBackground: 'var(--background)',
    classText: 'var(--foreground)',
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
    const getResolvedColor = (cssVar: string) => {
        if (typeof window === 'undefined') return '';
        // Extracts the variable name from var(--name)
        const varName = cssVar.match(/--[\w-]+/)?.[0];
        if (!varName) return cssVar;
        // Returns the HSL value string "H S% L%"
        const hslValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        // Returns a valid CSS color string
        return `hsl(${hslValue})`;
    };
    
    // Deep clone the config to avoid mutating the default object
    const resolvedConfig = JSON.parse(JSON.stringify(config));
    
    if (resolvedConfig.themeVariables) {
        for (const key in resolvedConfig.themeVariables) {
            const value = resolvedConfig.themeVariables[key];
            if (typeof value === 'string' && value.includes('var(--')) {
                 const resolvedColor = getResolvedColor(value);
                 if (resolvedColor) {
                    resolvedConfig.themeVariables[key] = resolvedColor;
                 }
            }
        }
    }
    
    mermaid.initialize(resolvedConfig);

    const renderMermaid = async () => {
      try {
        const id = `mermaid-graph-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: newSvg } = await mermaid.render(
          id,
          chart
        );
        setSvg(newSvg);
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        setSvg('<div class="p-4 text-destructive">Error rendering diagram.</div>');
      }
    };

    if (chart) {
      renderMermaid();
    } else {
      setSvg(null);
    }
  }, [chart, config]);
  
  if (!svg) {
    return <div className="p-4 text-muted-foreground w-full text-center">Loading diagram...</div>;
  }
  
  return <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
}
