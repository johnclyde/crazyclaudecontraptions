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
    let latexPart = "";

    parts.forEach((part, index) => {
      if (part.startsWith("__OPTION_") && part.endsWith("__")) {
        options[part] = parts[index + 1].trim();
      } else if (
        !parts[index - 1] ||
        !parts[index - 1].startsWith("__OPTION_")
      ) {
        latexPart += part;
      }
    });

    return (
      <div>
        <div style={{ display: "inline-block" }}>
          {Object.keys(options).map((optionKey) => (
            <span
              key={`option-${optionKey}`}
              style={{ display: "inline-block", margin: "0 8px" }}
            >
              <button
                onClick={() => onOptionClick(optionKey)}
                className={`px-2 py-1 mr-2 mb-2 border rounded focus:outline-none focus:ring ${
                  selectedOption === optionKey
                    ? "bg-green-200 border-green-500"
                    : "hover:bg-gray-100 focus:border-blue-300"
                }`}
              >
                {optionKey}
              </button>
              {options[optionKey]}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MathJaxContext config={mathJaxConfig}>{renderContent()}</MathJaxContext>
  );
};

export default LatexRenderer;
