interface FailureDetail {
  test_case: string;
  expected: string;
  received: string;
  error_message: string;
}

interface TestResult {
  state: "passed" | "failed";
  tests_run: number;
  passed: number;
  failed: number;
  failure_details: FailureDetail[];
  stdout: string;
  stderr: string;
  compilation_error: string;
  runtime_error: string;
  execution_time_exceeded: boolean;
  memory_exceeded: boolean;
}

export type {
  TestResult
}