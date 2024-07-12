import React, { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const InteractiveCounter = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Interactive Counter</h1>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={decrement}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <MinusCircle size={24} />
          </button>
          <span className="text-4xl font-bold">{count}</span>
          <button
            onClick={increment}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <PlusCircle size={24} />
          </button>
        </div>
      </div>
      {count === 10 && (
        <Alert className="mt-4 max-w-sm">
          <AlertTitle>Congratulations!</AlertTitle>
          <AlertDescription>
            You've reached 10! Keep going!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InteractiveCounter;
