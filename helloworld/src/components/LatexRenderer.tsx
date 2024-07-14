import React from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface LatexRendererProps {
  latex: string;
}

const config = {
  loader: { load: ["input/tex", "output/svg"] },
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
    processEscapes: true,
    processEnvironments: true,
  },
  svg: {
    fontCache: "global",
  },
};

const LatexRenderer: React.FC<LatexRendererProps> = ({ latex }) => {
  return (
    <MathJaxContext config={config}>
      <MathJax>{latex}</MathJax>
    </MathJaxContext>
  );
};

export default LatexRenderer;
