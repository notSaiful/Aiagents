
"use client"
import { useEffect, useState } from "react";
import type { MermaidConfig } from "mermaid";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

const getMermaidConfig = (theme: string | undefined): MermaidConfig => ({
  startOnLoad: false,
  theme: theme === 'dark' ? 'dark' : 'base',
  themeVariables: {
    background: theme === 'dark' ? '#24293A' : '#FFFFFF',
    primaryColor: theme === 'dark' ? '#3B4261' : '#F7F7FF',
    primaryTextColor: theme === 'dark' ? '#FFFFFF' : '#24293A',
    primaryBorderColor: theme === 'dark' ? '#8F98C0' : '#A8A2FF',
    lineColor: theme === 'dark' ? '#C2C8E7' : '#3B4261',
    secondaryColor: theme === 'dark' ? '#3B4261' : '#F7F7FF',
    tertiaryColor: theme === 'dark' ? '#2F354F' : '#FDFDFD',
    fontFamily: '"Poppins", sans-serif',
    fontSize: '16px',
    nodeBorder: theme === 'dark' ? '#8F98C0' : '#A8A2FF',
    mainBkg: theme === 'dark' ? '#3B4261' : '#A8A2FF',
    pieTitleTextSize: '18px',
    pieTitleTextColor: theme === 'dark' ? '#FFFFFF' : '#24293A',
    edgeLabelBackground: theme === 'dark' ? '#24293A' : '#FFFFFF',
    classText: theme === 'dark' ? '#FFFFFF' : '#24293A',
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
});


interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const effectiveTheme = theme === 'system' ? resolvedTheme : theme;
    const config = getMermaidConfig(effectiveTheme);
    
    mermaid.initialize(config);

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
        setSvg('<div class="p-4 text-destructive">Error rendering diagram. Please check the Mermaid syntax.</div>');
      }
    };

    if (chart) {
      renderMermaid();
    } else {
      setSvg(null);
    }
  }, [chart, theme, resolvedTheme]);
  
  if (!svg) {
    return <div className="p-4 text-muted-foreground w-full text-center">Loading diagram...</div>;
  }
  
  return <div className="w-full h-full flex justify-center items-center" dangerouslySetInnerHTML={{ __html: svg }} />;
}
