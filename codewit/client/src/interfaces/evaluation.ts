// Evaluation-related types for client-side consumption

export interface EvaluationTestCase {
  message: string;
  passed: boolean;
  expected?: string;
  actual?: string;
}

export interface EvaluationResponse {
  tests_run: number;
  passed: number;
  failed: number;
  error?: string;
  state: string;
  test_cases?: EvaluationTestCase[];
  rawout?: string;
}

export interface AttemptWithEval {
  attempt: any; // Can refine if Attempt type is imported
  evaluation: EvaluationResponse;
}
