type EvaluationState =
  | 'passed'
  | 'failed'
  | 'compile_error'
  | 'runtime_error'
  | 'execution_error'
  | 'execution_blocked';

type LearnerHintConfidence = 'high' | 'medium' | 'low';

type LearnerHintKind =
  | 'missing_variable'
  | 'missing_function'
  | 'name_error'
  | 'name_mismatch'
  | 'output_mismatch'
  | 'syntax_error'
  | 'indentation_error'
  | 'dataframe_mismatch'
  | 'compile_error'
  | 'runtime_error'
  | 'timeout'
  | 'memory_limit'
  | 'unknown';

interface LearnerHint {
  kind: LearnerHintKind;
  confidence: LearnerHintConfidence;
  title: string;
  summary: string;
  next_steps: string[];
}

interface FailureDetail {
  test_case: string | number;
  expected: string;
  received: string;
  error_message: string;
  rawout: string;
  stderr?: string;
  learner_hint?: LearnerHint;
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
  learner_hint?: LearnerHint | null;
}

export type {
  EvaluationState,
  LearnerHint,
  LearnerHintConfidence,
  LearnerHintKind,
  FailureDetail,
  TestResult,
};
