import type { AttemptDTO, FailureDetail, TestResult } from '@codewit/interfaces';

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
  error: string;
}

export type EvaluationResponse = TestResult | EvaluationErrorResponse;

export interface AttemptWithEval {
  attempt: AttemptDTO | null;
  evaluation: EvaluationResponse;
}
