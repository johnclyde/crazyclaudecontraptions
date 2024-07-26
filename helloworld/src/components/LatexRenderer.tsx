import React from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface LatexRendererProps {
  latex: string;
  onOptionClick?: (option: string) => void;
  selectedOption?: string | null;
}

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/svg", "[tex]/ams"] },
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
  svg: {
    fontCache: "global",
  },
};

const LatexRenderer: React.FC<LatexRendererProps> = ({
  latex,
  onOptionClick,
  selectedOption,
}) => {
  const renderContent = () => {
    const parts = latex.split(/(__OPTION_[A-E]__)/);

    return parts.map((part, index) => {
      if (part.startsWith("__OPTION_") && part.endsWith("__")) {
        // This is an option identifier
        const option = part.replace(/__OPTION_([A-E])__/, "$1");
        const isSelected = selectedOption === option;
        return (
          <button
            key={index}
            onClick={() => onOptionClick && onOptionClick(option)}
            className={`px-2 py-1 mr-2 border rounded focus:outline-none focus:ring ${
              isSelected
                ? "bg-green-200 border-green-500"
                : "hover:bg-gray-100 focus:border-blue-300"
            }`}
          >
            ({option})
          </button>
        );
      } else {
        return <MathJax key={index} inline={false}>{`${part}`}</MathJax>;
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
