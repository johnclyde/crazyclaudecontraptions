import React from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface LatexRendererProps {
  latex: string;
}

const mathJaxConfig = {
  loader: { load: ["input/asciimath", "output/chtml", "[tex]/ams"] },
  asciimath: {
    delimiters: [
      ["$", "$"],
      ["`", "`"],
    ],
  },
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
    packages: { "[+]": ["ams"] },
  },
};

const LatexRenderer: React.FC<LatexRendererProps> = ({ latex }) => {
  const preprocessLatex = (input: string) => {
    // Parse options if present
    const optionRegex = /option ([A-E]): (.*?)(?=option [A-E]:|$)/gs;
    let match;
    let processed = input;
    while ((match = optionRegex.exec(processed)) !== null) {
      const [fullMatch, option, content] = match;
      processed = processed.replace(
        fullMatch,
        `<strong>Option ${option}:</strong> ${content}`,
      );
    }

    return processed;
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <MathJax dynamic>{preprocessLatex(latex)}</MathJax>
    </MathJaxContext>
  );
};

export default LatexRenderer;
