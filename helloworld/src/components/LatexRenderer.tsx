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

    // Process the parts to create a map of options
    const options = {};
    const latexParts = [];

    parts.forEach((part, index) => {
      if (part.startsWith("__OPTION_") && part.endsWith("__")) {
        options[part] = parts[index + 1].trim();
      } else if (
        !parts[index - 1] ||
        !parts[index - 1].startsWith("__OPTION_")
      ) {
        latexParts.push(part);
      }
    });

    return (
      <div>
        {/* Render the LaTeX parts above the options */}
        {latexParts.map((part, index) => (
          <MathJax key={`latex-part-${index}`}>{part}</MathJax>
        ))}
        <div className="flex flex-wrap mt-2">
          {Object.entries(options).map(([optionKey, optionValue]) => {
            const optionLabel = optionKey.match(/__OPTION_([A-E])__/)[1];
            return (
              <div
                key={`option-${optionKey}`}
                className="flex items-center mr-4 mb-2"
              >
                <button
                  onClick={() => onOptionClick(optionKey)}
                  className={`px-2 py-1 mr-2 border rounded focus:outline-none focus:ring ${
                    selectedOption === optionKey
                      ? "bg-green-200 border-green-500"
                      : "hover:bg-gray-100 focus:border-blue-300"
                  }`}
                >
                  ({optionLabel})
                </button>
                <MathJax>{optionValue}</MathJax>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <MathJaxContext config={mathJaxConfig}>{renderContent()}</MathJaxContext>
  );
};

export default LatexRenderer;
