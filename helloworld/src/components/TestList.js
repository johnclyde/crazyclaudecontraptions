import React from "react";
import { Link } from "react-router-dom";

const TestList = ({ tests }) => {
  if (tests.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-600">No tests found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-2">{test.competition}</h3>
            <p className="text-gray-600 mb-4">{`${test.year} - ${test.exam}`}</p>
            <Link
              to={`/competition/${test.competition}/${test.year}/${test.exam}`}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              Take Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestList;
