type EvaluationState =
  | 'passed'
  | 'failed'
  | 'compile_error'
  | 'runtime_error'
  | 'execution_error'
  | 'execution_blocked';

interface FailureDetail {
  test_case: string | number;
  expected: string;
  received: string;
  error_message: string;
  rawout: string;
  stderr?: string;
}

interface TestResult {
  state: EvaluationState;
  tests_run: number;
  passed: number;
  failed: number;
  errors: number;
  no_tests_collected: boolean;
  exit_code: number | null;
  failure_details: FailureDetail[];
  compilation_error: string;
  runtime_error: string;
  execution_time_exceeded: boolean;
  memory_exceeded: boolean;
}

export type {
  EvaluationState,
  FailureDetail,
  TestResult,
};
