import { BiSolidRightArrow, BiSolidLeftArrow } from 'react-icons/bi';
import { useState, useMemo } from 'react';

type FailureDetail = {
  test_case: string;
  expected?: string;
  received?: string;
  error_message: string;
  rawout?: string;
};

type EvalProps = {
  evaluation: {
    state: string;
    tests_run: number;
    passed: number;
    failed: number;
    failure_details?: FailureDetail[];
    compilation_error?: string;
    runtime_error?: string;
    execution_time_exceeded?: boolean;
    memory_exceeded?: boolean;
    rawout?: string;
  } | null;
};

const CodeSubmission = ({ evaluation }: EvalProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'outcome' | 'output'>('outcome');
  const [issueIdx, setIssueIdx] = useState(0);

  if (!evaluation) {
    return (
      <div className="p-6 min-h-full flex flex-col items-start bg-alternate-background-500 rounded-lg shadow-lg border-2 border-white">
        <h1 className="text-2xl font-bold text-white">Results</h1>
        <p className="text-white mt-4">Submit code to see evaluation results.</p>
      </div>
    );
  }

  const {
    state,
    tests_run,
    passed,
    failure_details = [],
    compilation_error = '',
    runtime_error = '',
    execution_time_exceeded = false,
    memory_exceeded = false,
    rawout = '',
  } = evaluation;

  const errorMessage = useMemo(() => {
    if (compilation_error) return compilation_error;
    if (runtime_error) return runtime_error;
    if (execution_time_exceeded) return 'Execution time exceeded';
    if (memory_exceeded) return 'Memory limit exceeded';
    return null;
  }, [compilation_error, runtime_error, execution_time_exceeded, memory_exceeded]);

  const hasFailures = failure_details.length > 0;
  const hasOutput = rawout.trim().length > 0;
  const allPassed = !errorMessage && !hasFailures && state === 'passed';
  const activeIssue = failure_details[issueIdx] || null;
  const showOutcomeTab = !errorMessage;

  return (
    <div className="p-6 min-h-full flex flex-col items-start bg-alternate-background-500 rounded-lg shadow-lg border-2 border-white" data-testid="check-list">
      <div className="w-full mb-4">
        <h1 className="text-2xl font-bold text-white">Results</h1>
        {tests_run > 0 && (
          <div className="mt-1 text-white text-base font-medium">
            Checked: {passed} of {tests_run} test cases produced correct results
          </div>
        )}
        {!errorMessage && hasFailures && (
          <div className="flex items-center gap-2 mt-2">
            <h2 className="text-lg text-white">Issues</h2>
            <button
              disabled={issueIdx === 0}
              onClick={() => setIssueIdx(i => Math.max(0, i - 1))}
              className="p-1"
            >
              <BiSolidLeftArrow className="text-accent-400" />
            </button>
            <span className="text-white text-sm">{issueIdx + 1} / {failure_details.length}</span>
            <button
              disabled={issueIdx === failure_details.length - 1}
              onClick={() => setIssueIdx(i => Math.min(failure_details.length - 1, i + 1))}
              className="p-1"
            >
              <BiSolidRightArrow className="text-accent-400" />
            </button>
          </div>
        )}
        {allPassed && <span className="text-green-400 font-semibold">All tests passed!</span>}
        {errorMessage && <span className="text-red-400 font-semibold">{errorMessage}</span>}
      </div>

      <div className="w-full flex justify-start border-b border-white">
        {showOutcomeTab && (
          <button
            className={`px-6 py-2 font-bold text-lg ${
              activeTab === 'outcome'
                ? 'text-white bg-background-700 border-4 border-white border-b-0'
                : 'text-gray-400 border border-white border-b-0'
            }`}
            onClick={() => setActiveTab('outcome')}
          >
            Outcome
          </button>
        )}
        {hasOutput && (
          <button
            className={`px-6 py-2 font-bold text-lg ${
              activeTab === 'output'
                ? 'text-white bg-background-700 border-4 border-white border-b-0'
                : 'text-gray-400 border border-white border-b-0'
            }`}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
        )}
      </div>

      <div className="w-full pt-4 text-white">
        {activeTab === 'outcome' && showOutcomeTab ? (
          <>
            {errorMessage && (
              <div className="border border-red-500 p-4 bg-black mb-4">
                <span className="font-bold text-red-400">{errorMessage}</span>
              </div>
            )}
            {!errorMessage && hasFailures && activeIssue && (
              <div className="border border-cyan-500 p-4 bg-black mb-4">
                <span className="font-bold text-red-400">{activeIssue.error_message}</span>
                {activeIssue.expected && (
                  <div className="mt-2 border border-cyan-500 p-2">
                    <span className="text-cyan-300 font-semibold">Expected:</span>
                    <pre className="font-mono bg-black mt-1 whitespace-pre-wrap">{activeIssue.expected}</pre>
                  </div>
                )}
                {activeIssue.received && (
                  <div className="mt-2 border border-cyan-500 p-2">
                    <span className="text-cyan-300 font-semibold">Actual:</span>
                    <pre className="font-mono bg-black mt-1 whitespace-pre-wrap">{activeIssue.received}</pre>
                  </div>
                )}
              </div>
            )}
            {!errorMessage && !hasFailures && (
              <div className="border border-cyan-500 p-4 bg-black mb-4">
                <span className="text-gray-300">No test cases to show.</span>
              </div>
            )}
          </>
        ) : (
          activeTab === 'output' && hasOutput && (
            <div className="border border-cyan-500 p-4 bg-black">
              <pre className="font-mono whitespace-pre-wrap">{rawout}</pre>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CodeSubmission;