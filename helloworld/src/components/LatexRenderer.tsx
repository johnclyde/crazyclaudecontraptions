import React from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface LatexRendererProps {
  latex: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ latex }) => {
  const preprocessLatex = (input: string) => {
    // Replace single $ with \( and \)
    let processed = input.replace(/\$(.+?)\$/g, "\\($1\\)");

    // Parse options if present
    const optionRegex = /option ([A-E]): (.*?)(?=option [A-E]:|$)/gs;
    let match;
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
    <MathJaxContext>
      <MathJax>{preprocessLatex(latex)}</MathJax>
    </MathJaxContext>
  );
};

export default LatexRenderer;
