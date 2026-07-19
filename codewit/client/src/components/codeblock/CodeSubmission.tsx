import { BiSolidRightArrow, BiSolidLeftArrow } from 'react-icons/bi';
import { useState } from 'react';
import type { EvaluationResponse } from '../../interfaces/evaluation';
import type { LearnerHint } from '@codewit/interfaces';

type EvalProps = {
  evaluation: EvaluationResponse | null;
};

const fallbackHint: LearnerHint = {
  kind: 'unknown',
  confidence: 'low',
  title: 'The lesson found a problem',
  summary: 'Open the Output tab to see the technical details, then fix the first error shown there.',
  next_steps: [
    'Read the first technical error in Output.',
    'Fix that error and submit again.'
  ],
};

const HintCard = ({ hint }: { hint: LearnerHint }): JSX.Element => {
  return (
    <div className="border border-cyan-500 p-4 bg-black mb-4">
      <h3 className="font-bold text-red-300 text-xl">{hint.title}</h3>
      <p className="mt-2 text-white whitespace-pre-wrap">{hint.summary}</p>
      {hint.next_steps.length > 0 && (
        <div className="mt-3">
          <div className="text-cyan-300 font-semibold">Try this next:</div>
          <ul className="mt-2 list-disc list-inside space-y-1 text-gray-200">
            {hint.next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
  } = evaluation;
  const error = 'error' in evaluation ? evaluation.error : '';
  const activeIssue = failure_details[issueIdx] || null;
  const topLevelHint = 'learner_hint' in evaluation ? (evaluation.learner_hint ?? null) : null;
  const activeHint = activeIssue?.learner_hint || topLevelHint || (state === 'passed' ? null : fallbackHint);
  const technicalOutput = activeIssue?.rawout || compilation_error || runtime_error || error || '';

  const hasFailures = failure_details.length > 0;
  const hasOutput = technicalOutput.trim().length > 0;
  const allPassed = !hasFailures && !compilation_error && !runtime_error && !execution_time_exceeded && !memory_exceeded && !error && state === 'passed';
  const showOutcomeTab = true;

  return (
    <div className="p-6 min-h-full flex flex-col items-start bg-alternate-background-500 rounded-lg shadow-lg border-2 border-white" data-testid="check-list">
      <div className="w-full mb-4">
        <h1 className="text-2xl font-bold text-white">Results</h1>
        {tests_run > 0 && (
          <div className="mt-1 text-white text-base font-medium">
            Checked: {passed} of {tests_run} test cases produced correct results
          </div>
        )}
        {hasFailures && (
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
            {!allPassed && activeHint && (
              <HintCard hint={activeHint} />
            )}
            {hasFailures && activeIssue && (
              <div className="border border-cyan-500 p-4 bg-black mb-4">
                <span className="font-bold text-cyan-300">{activeIssue.test_case}</span>
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
                <p className="mt-3 text-gray-300">Open the Output tab to see the technical details for this issue.</p>
              </div>
            )}
            {!allPassed && !hasFailures && !activeHint && (
              <div className="border border-cyan-500 p-4 bg-black mb-4">
                <span className="text-gray-300">Open the Output tab to see the technical details.</span>
              </div>
            )}
          </>
        ) : (
          activeTab === 'output' && hasOutput && (
            <div className="border border-cyan-500 p-4 bg-black">
              <pre className="font-mono whitespace-pre-wrap">{technicalOutput}</pre>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CodeSubmission;
