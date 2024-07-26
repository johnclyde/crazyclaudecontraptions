import React from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface LatexRendererProps {
  latex: string;
  onOptionClick?: (option: string) => void;
  selectedOption?: string | null;
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

const LatexRenderer: React.FC<LatexRendererProps> = ({
  latex,
  onOptionClick,
  selectedOption,
}) => {
  const renderContent = () => {
    const parts = latex.split(/__OPTION_([A-E])__/);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is an option identifier
        const isSelected = selectedOption === part;
        return (
          <button
            key={index}
            onClick={() => onOptionClick && onOptionClick(part)}
            className={`px-2 py-1 mr-2 border rounded focus:outline-none focus:ring ${
              isSelected
                ? "bg-green-200 border-green-500"
                : "hover:bg-gray-100 focus:border-blue-300"
            }`}
          >
            Option {part}
          </button>
        );
      } else {
        // This is regular LaTeX content
        return <MathJax key={index}>{part}</MathJax>;
      }
    });
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div>{renderContent()}</div>
    </MathJaxContext>
  );
};

export default LatexRenderer;
