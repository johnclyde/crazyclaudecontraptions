import React from 'react';
import { Link } from 'react-router-dom';

const ComponentDirectory = () => {
  const components = [
    { name: 'Banzuke Surfer', path: '/banzuke-surfer', description: 'Banzuke Surfing Utility' },
    { name: 'Interactive Counter', path: '/interactive-counter', description: 'A counter with increment and decrement buttons' },
    { name: 'Color Picker', path: '/color-picker', description: 'An interactive color picker with real-time preview' },
    { name: 'GrindOlympiads Index', path: '/grind-olympiads', description: 'Index page for GrindOlympiads math platform' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">React Component Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <Link
              to={item.path}
              className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              View Component
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentDirectory;
