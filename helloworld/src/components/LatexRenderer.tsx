import React from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface LatexRendererProps {
  latex: string;
}

const config = {
  loader: { load: ["input/asciimath"] },
  asciimath: {
    delimiters: [
      ["$", "$"],
      ["`", "`"],
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
