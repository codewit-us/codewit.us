// import ChecklistItem from './ChecklistItem';
// import Progress from './Progress';
import { TestResult } from '@codewit/interfaces';
import { BiSolidRightArrow, BiSolidLeftArrow } from "react-icons/bi";
import { useState } from 'react';

const CodeSubmission = (): JSX.Element => {
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
  const [activeTab, setActiveTab] = useState('output');

  return (
    <div className="p-4 min-h-full flex flex-col items-center bg-alternate-background-500 rounded-lg shadow-lg border-2 border-white" data-testid="check-list">
      <div className="w-full mb-4 gap-3 items-center justify-start">
				<h1 className="text-2xl font-bold text-white">Results</h1>
				<div className="flex items-center gap-2 ">
					<h2 className="flex text-lg justify-start text-white">Issues</h2>
					<div className="flex items-center justify-end">
            <BiSolidLeftArrow className='text-accent-400'/>
            <BiSolidRightArrow className='text-accent-400'/>
					</div>
				</div>
      </div>

      <div className="w-full">
        <div className="flex ">
          <button 
            className={`px-6 font-bold text-lg ${activeTab === 'outcome' 
              ? 'text-white bg-background-700 border-4 border-white border-b-0 border-l-0 ' 
              : 'text-gray-400 border border-white border-b-0 border-l-0'}`}
            onClick={() => setActiveTab('outcome')}
          >
            Outcome
          </button>
           <button 
            className={`px-6 font-bold text-lg ${activeTab === 'output' 
              ? 'text-white bg-background-700 border-4 border-white border-b-0' 
              : 'text-gray-400 border border-white border-b-0'}`}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
        </div> 
        
        <div className="relative h-1">
          {activeTab === 'outcome' && (
            <div className="absolute bottom-0 right-0 h-1 border-b-4 border-white w-[calc(100%-127px)]"></div>
          )}
          {activeTab === 'output' && (
            <div className="absolute bottom-0 left-0 h-1 border-b-4 border-white w-[132px]"></div>
          )}
          {activeTab === 'output' && (
            <div className="absolute bottom-0 right-0 h-1 border-b-4 border-white w-[calc(100%-240px)]"></div>
          )}
        </div>
      </div>

      <div className="w-full pt-4">
        {activeTab === 'outcome' && (
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2">When user enters '0' or less then 'No pizza is impossible' should be displayed</h3>
            
            <h4 className="text-2xl mt-6 mb-3">Expected results</h4>
            <div className="border border-cyan-500 p-4 bg-black mb-6">
              <p className="text-white font-mono whitespace-pre-wrap">
                Diameter of your pizza No pizza is impossible
              </p>
            </div>
            
            <h4 className="text-2xl mb-3">Results from your code</h4>
            <div className="border border-cyan-500 p-4 bg-black ">
              <p className="text-white font-mono whitespace-pre-wrap">
                Diameter of your pizza? Number of slices? Segmentation fault
              </p>
            </div>
          </div>
        )}
        {activeTab === 'output' && (
          <div className="text-white">
            <div className="border border-cyan-500 p-4 bg-black ">
              <p className="text-white font-mono whitespace-pre-wrap">
                Diameter of your pizza?
              </p>
              <p className="text-white font-mono whitespace-pre-wrap">
                No pizza is impossible
              </p>
            </div>
          </div>
        )}
        {activeTab === 'errors' && (
          <div className="text-white">
            <div className="bg-black p-4 rounded">
              <p>Diameter of your pizza?</p>
              <p>Number of slices?</p>
              <p>Segmentation fault</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSubmission;