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

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-full mb-4 flex gap-2 flex-row items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Results</h1>
        <Progress percentage={60} />
      </div>
      <div className="w-full">
        {checklistItems.map((item, index) => (
          <ChecklistItem key={index} checked={item.checked} text={item.text} />
        ))}
      </div>
    </div>
  );
};

export default ResultsComponent;
