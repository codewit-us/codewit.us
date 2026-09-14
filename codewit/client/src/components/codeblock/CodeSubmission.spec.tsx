import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { EvaluationResponse } from '../../interfaces/evaluation';
import CodeSubmission from './CodeSubmission';

afterEach(() => {
  cleanup();
});

describe('CodeSubmission', () => {
  it('shows the learner hint in Outcome and keeps technical details in Output', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 1,
      passed: 0,
      failed: 1,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [
        {
          test_case: 'test_hat_variables',
          expected: '',
          received: '',
          error_message: "AttributeError: module 'program' has no attribute 'numberOfHats'",
          rawout: "E       AttributeError: module 'program' has no attribute 'numberOfHats'",
          learner_hint: {
            kind: 'name_mismatch',
            confidence: 'high',
            title: 'The variable name does not match the lesson',
            summary: 'This lesson expected numberOfHats, but your code used NumberOfHats.',
            next_steps: ['Rename NumberOfHats to numberOfHats.'],
          },
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
      learner_hint: {
        kind: 'name_mismatch',
        confidence: 'high',
        title: 'The variable name does not match the lesson',
        summary: 'This lesson expected numberOfHats, but your code used NumberOfHats.',
        next_steps: ['Rename NumberOfHats to numberOfHats.'],
      },
    };

    render(<CodeSubmission evaluation={evaluation} />);

    expect(screen.getByText('The variable name does not match the lesson')).toBeTruthy();
    expect(screen.queryByText(/AttributeError/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Output' }));

    expect(screen.getByText(/AttributeError/)).toBeTruthy();
  });

  it('shows a top-level learner hint for technical errors without failure details', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [],
      compilation_error: '',
      runtime_error: 'SyntaxError: invalid syntax',
      execution_time_exceeded: false,
      memory_exceeded: false,
      learner_hint: {
        kind: 'syntax_error',
        confidence: 'high',
        title: 'Python could not read your code',
        summary: 'SyntaxError: invalid syntax',
        next_steps: ['Fix the syntax problem and submit again.'],
      },
    };

    render(<CodeSubmission evaluation={evaluation} />);

    expect(screen.getByText('Python could not read your code')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Output' }));

    expect(screen.getByText('SyntaxError: invalid syntax')).toBeTruthy();
  });

  it('shows failure error messages and stderr when raw output is empty', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 1,
      passed: 0,
      failed: 1,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [{
        test_case: 'test_java',
        expected: '',
        received: '',
        error_message: 'Assertion failed in Java test',
        rawout: '',
        stderr: 'java.lang.AssertionError',
      }],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    render(<CodeSubmission evaluation={evaluation} />);
    fireEvent.click(screen.getByRole('button', { name: 'Output' }));

    expect(screen.getByText(/Assertion failed in Java test/)).toBeTruthy();
    expect(screen.getByText(/java.lang.AssertionError/)).toBeTruthy();
  });

  it('shows partial evaluator streams for a timeout', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      no_tests_collected: false,
      exit_code: null,
      failure_details: [],
      compilation_error: '',
      runtime_error: 'Execution timed out',
      execution_time_exceeded: true,
      memory_exceeded: false,
      stdout: 'started processing',
      stderr: 'still waiting',
    };

    render(<CodeSubmission evaluation={evaluation} />);
    fireEvent.click(screen.getByRole('button', { name: 'Output' }));

    expect(screen.getByText(/Execution timed out/)).toBeTruthy();
    expect(screen.getByText(/started processing/)).toBeTruthy();
    expect(screen.getByText(/still waiting/)).toBeTruthy();
  });

  it('does not repeat a diagnostic already contained in raw output', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 1,
      passed: 0,
      failed: 1,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [{
        test_case: 'test_value',
        expected: '',
        received: '',
        error_message: 'unique assertion diagnostic',
        diagnostic: 'unique assertion diagnostic',
        rawout: 'pytest header\nunique assertion diagnostic\npytest summary',
      }],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    render(<CodeSubmission evaluation={evaluation} />);
    fireEvent.click(screen.getByRole('button', { name: 'Output' }));

    expect(screen.getByText(/unique assertion diagnostic/).textContent?.match(/unique assertion diagnostic/g)).toHaveLength(1);
  });

  it('resets the selected issue when a new evaluation has fewer failures', () => {
    const firstEvaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 2,
      passed: 0,
      failed: 2,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [
        { test_case: 'first', expected: '', received: '', error_message: 'first error', rawout: 'first output' },
        { test_case: 'second', expected: '', received: '', error_message: 'second error', rawout: 'second output' },
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };
    const nextEvaluation: EvaluationResponse = {
      ...firstEvaluation,
      tests_run: 1,
      failed: 1,
      failure_details: [
        { test_case: 'replacement', expected: '', received: '', error_message: 'replacement error', rawout: 'replacement output' },
      ],
    };
    const { rerender } = render(<CodeSubmission evaluation={firstEvaluation} />);

    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(screen.getByText('second')).toBeTruthy();

    rerender(<CodeSubmission evaluation={nextEvaluation} />);

    expect(screen.getByText('replacement')).toBeTruthy();
  });
});
