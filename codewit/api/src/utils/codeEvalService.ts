import { createHttpClient, post } from '../utils/httpClient';
import type { FailureDetail, TestResult } from '@codewit/interfaces';

const codeEvalUrl = process.env.CODEEVAL_URL || 'http://codeeval:3002';
const httpClient = createHttpClient(codeEvalUrl);

export interface EvaluationPayload {
  language: string;
  code: string;
  runTests: boolean;
  testCode: string;
}

export type EvaluationFailureDetail = FailureDetail;
export type EvaluationResponse = TestResult;

export const executeCodeEvaluation = async (
  payload: EvaluationPayload,
  cookies?: string
): Promise<EvaluationResponse> => {
  return await post<EvaluationResponse>(httpClient, '/execute', payload, cookies);
};
