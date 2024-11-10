// codewit/client/src/components/codeblock/Checklist.tsx
import React from 'react';
import ChecklistItem from './ChecklistItem';
import Progress from './Progress';

const ResultsComponent = (): JSX.Element => {
  const checklistItems = [
    { checked: true, text: 'Ordered List' },
    { checked: true, text: 'Reversed List' },
    { checked: true, text: 'Scrambled List' },
    { checked: true, text: 'Single Item List' },
    { checked: false, text: 'Empty List' },
    { checked: false, text: 'Duplicates' },
    { checked: true, text: 'Missing Data' },
    { checked: true, text: 'Negative Numbers' },
    { checked: false, text: 'Divide By Zero' },
    { checked: false, text: 'Large List' }
  ];

  const passedTests = checklistItems.filter(item => item.checked).length;
  const totalTests = checklistItems.length;

  return (
    <div className="p-4 flex flex-col items-center bg-black rounded-lg shadow-lg">
      <div className="w-full mb-4 flex gap-3 flex-row items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Results</h1>
        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-medium text-gray-200">
          {passedTests}/{totalTests}
        </span>
        <Progress percentage={60} />
      </div>
      <div className="w-full space-y-1">
        {checklistItems.map((item, index) => (
          <ChecklistItem key={index} checked={item.checked} text={item.text} />
        ))}
      </div>
    </div>
  );
};

export default ResultsComponent;