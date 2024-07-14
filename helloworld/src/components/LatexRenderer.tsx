import React from "react";
import { MathJax, MathJaxContext } from "mathjax-react";

interface LatexRendererProps {
  latex: string;
}

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

const LatexRenderer: React.FC<LatexRendererProps> = ({ latex }) => {
  return (
    <MathJaxContext config={config}>
      <MathJax inline={false}>{latex}</MathJax>
    </MathJaxContext>
  );
};

export default LatexRenderer;
