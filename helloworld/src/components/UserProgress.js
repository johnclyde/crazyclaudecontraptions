import React from "react";

const UserProgress = ({ userProgress }) => {
  if (!userProgress || userProgress.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            You haven't completed any tests yet. Start taking tests to see your
            progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Completed Tests</h3>
        <ul className="space-y-2">
          {userProgress.map((progress, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b border-gray-200 py-2 last:border-b-0"
            >
              <span className="text-gray-700">{`${progress.competition} ${progress.year} ${progress.exam}`}</span>
              <span className="text-blue-600 font-semibold">{`Score: ${progress.score}`}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProgress;
