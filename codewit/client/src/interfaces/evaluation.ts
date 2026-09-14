import type { AttemptDTO, FailureDetail, LearnerHint, TestResult } from '@codewit/interfaces';

export interface EvaluationErrorResponse {
  state: 'error';
  tests_run: 0;
  passed: 0;
  failed: 0;
  errors: 0;
  no_tests_collected: false;
  exit_code: null;
  failure_details: FailureDetail[];
  compilation_error: '';
  runtime_error: '';
  execution_time_exceeded: false;
  memory_exceeded: false;
  stdout?: string;
  stderr?: string;
  rawout?: string;
  error: string;
  learner_hint?: LearnerHint | null;
}

export type EvaluationResponse = TestResult | EvaluationErrorResponse;

export interface AttemptWithEval {
  attempt: AttemptDTO | null;
  evaluation: EvaluationResponse;
}
