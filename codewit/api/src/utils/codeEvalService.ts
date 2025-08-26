import { createHttpClient, post } from '../utils/httpClient';

const codeEvalUrl = process.env.CODEEVAL_URL || 'http://nginx';
const httpClient = createHttpClient(codeEvalUrl);

export interface EvaluationPayload {
  language: string;
  code: string;
  runTests: boolean;
  testCode: string;
}

export interface EvaluationResponse {
  tests_run: number;
  passed: number;
  failed: number;
  error: string;
  state: string;
}

export const executeCodeEvaluation = async (
  payload: EvaluationPayload,
  cookies?: string
): Promise<EvaluationResponse> => {
  return await post<EvaluationResponse>(httpClient, '/execute', payload, cookies);
};