import type { EvaluationResponse } from './codeEvalService';
import type { FailureDetail, LearnerHint } from '@codewit/interfaces';
import { extractExerciseContract } from './exerciseContract';

interface LearnerHintContext {
  referenceTest: string;
  submittedCode: string;
  topic?: string | null;
  title?: string | null;
}

type MatchReason = 'case' | 'format';
type BindingKind = 'variable' | 'function' | 'any';

function createHint(
  kind: LearnerHint['kind'],
  confidence: LearnerHint['confidence'],
  title: string,
  summary: string,
  next_steps: string[]
): LearnerHint {
  return {
    kind,
    confidence,
    title,
    summary,
    next_steps,
  };
}

function buildDiagnosticText(detail: FailureDetail, includeRawOutput: boolean): string {
  return [
    detail.diagnostic,
    detail.error_message,
    includeRawOutput ? detail.rawout : '',
  ]
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join('\n');
}

function extractFirstMatchingLine(input: string, pattern: RegExp): string {
  const match = input.match(pattern);
  return match ? match[0].trim() : '';
}

function normalizeInlineValue(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSuspiciousComparisonValue(value: string): boolean {
  const normalized = normalizeInlineValue(value);

  if (!normalized || normalized === '...') {
    return true;
  }

  return /={3,}|test session starts|short test summary|collected \d+ items|failed in \d|passed in \d|rootdir:/i.test(
    normalized
  );
}

function maskPythonCommentsAndStrings(code: string): string {
  let masked = '';
  let comment = false;
  let quote = '';
  let tripleQuoted = false;
  let escaped = false;

  for (let index = 0; index < code.length; index += 1) {
    const character = code[index];

    if (comment) {
      if (character === '\n') {
        comment = false;
        masked += '\n';
      } else {
        masked += ' ';
      }
      continue;
    }

    if (quote) {
      if (character === '\n') {
        masked += '\n';
        escaped = false;
        continue;
      }

      if (tripleQuoted && code.startsWith(quote.repeat(3), index)) {
        masked += '   ';
        index += 2;
        quote = '';
        tripleQuoted = false;
        continue;
      }

      masked += ' ';
      if (!tripleQuoted) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === quote) {
          quote = '';
        }
      }
      continue;
    }

    if (character === '#') {
      comment = true;
      masked += ' ';
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      tripleQuoted = code.startsWith(character.repeat(3), index);
      masked += tripleQuoted ? '   ' : ' ';
      if (tripleQuoted) index += 2;
      continue;
    }

    masked += character;
  }

  return masked;
}

function extractPythonBindings(code: string): { functions: string[]; variables: string[] } {
  const structuralCode = maskPythonCommentsAndStrings(code);
  const functions = collectUniqueMatches(
    structuralCode,
    /^\s*(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm
  );
  const variables = new Set<string>();

  for (const line of structuralCode.split('\n')) {
    const simpleAssignment = line.match(
      /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=]+)?=(?!=)/
    );
    if (simpleAssignment) {
      variables.add(simpleAssignment[1]);
    }

    const unpackingAssignment = line.match(
      /^\s*[\[(]?\s*([A-Za-z_][A-Za-z0-9_]*(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*)+)\s*[\])]?\s*=(?!=)/
    );
    if (unpackingAssignment) {
      unpackingAssignment[1]
        .split(',')
        .map((name) => name.trim())
        .forEach((name) => variables.add(name));
    }

    const importAlias = line.match(/^\s*import\s+[\w.]+\s+as\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/);
    if (importAlias) {
      variables.add(importAlias[1]);
    }

    const fromImport = line.match(
      /^\s*from\s+[\w.]+\s+import\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?\s*$/
    );
    if (fromImport) {
      variables.add(fromImport[2] || fromImport[1]);
    }
  }

  return {
    functions,
    variables: [...variables],
  };
}

function collectUniqueMatches(input: string, pattern: RegExp): string[] {
  return [...new Set(
    [...input.matchAll(pattern)]
      .map((match) => match[1] ?? '')
      .filter((value) => value.length > 0)
  )];
}

function normalizeIdentifier(identifier: string): string {
  return identifier.replace(/_/g, '').toLowerCase();
}

function findIdentifierMatch(
  expectedIdentifier: string,
  submittedCode: string,
  bindingKind: BindingKind
): null | { actual: string; reason: MatchReason } {
  const bindings = extractPythonBindings(submittedCode);
  const identifiers = bindingKind === 'function'
    ? bindings.functions
    : bindingKind === 'variable'
      ? bindings.variables
      : [...new Set([...bindings.functions, ...bindings.variables])];
  const caseMatch = identifiers.find((identifier) => (
    identifier !== expectedIdentifier &&
    identifier.toLowerCase() === expectedIdentifier.toLowerCase()
  ));

  if (caseMatch) {
    return { actual: caseMatch, reason: 'case' };
  }

  const formatMatch = identifiers.find((identifier) => (
    identifier !== expectedIdentifier &&
    normalizeIdentifier(identifier) === normalizeIdentifier(expectedIdentifier)
  ));

  if (formatMatch) {
    return { actual: formatMatch, reason: 'format' };
  }

  return null;
}

function describeDataframeStep(topic: string, operations: string[]): string {
  const normalizedTopic = topic.trim().toLowerCase();

  if (normalizedTopic.includes('pivot dataframe') || operations.includes('pivot_dataframe')) {
    return 'pivoting the DataFrame';
  }

  if (normalizedTopic.includes('melt dataframe') || operations.includes('melt_dataframe')) {
    return 'melting the DataFrame';
  }

  if (normalizedTopic.includes('query dataframe') || operations.includes('query_dataframe')) {
    return 'querying the DataFrame';
  }

  if (normalizedTopic.includes('describe dataframe') || operations.includes('describe_dataframe')) {
    return 'describing the DataFrame';
  }

  if (normalizedTopic.includes('load dataframe') || operations.includes('load_dataframe')) {
    return 'loading the DataFrame';
  }

  return 'working with the DataFrame';
}

function buildMissingIdentifierHint(
  expectedIdentifier: string,
  submittedCode: string,
  lessonLabel: string,
  isFunction: boolean
): LearnerHint {
  const similar = findIdentifierMatch(
    expectedIdentifier,
    submittedCode,
    isFunction ? 'function' : 'variable'
  );

  if (similar?.reason === 'case') {
    return createHint(
      'name_mismatch',
      'high',
      `The ${isFunction ? 'function' : 'variable'} name does not match the lesson`,
      `${lessonLabel} expected ${isFunction ? 'a function' : 'a variable'} named \`${expectedIdentifier}\`, but your code uses \`${similar.actual}\` instead. Python treats uppercase and lowercase letters as different.`,
      [
        `Rename \`${similar.actual}\` to \`${expectedIdentifier}\`.`,
        `Submit again after the ${isFunction ? 'function' : 'variable'} name matches exactly.`
      ]
    );
  }

  if (similar?.reason === 'format') {
    return createHint(
      'name_mismatch',
      'high',
      `The ${isFunction ? 'function' : 'variable'} name is very close, but it still does not match`,
      `${lessonLabel} expected ${isFunction ? 'a function' : 'a variable'} named \`${expectedIdentifier}\`, but your code uses \`${similar.actual}\`. Even small differences like missing underscores count as different names in Python.`,
      [
        `Rename \`${similar.actual}\` to \`${expectedIdentifier}\`.`,
        'Check the spelling carefully, including underscores.'
      ]
    );
  }

  return createHint(
    isFunction ? 'missing_function' : 'missing_variable',
    'high',
    `The lesson could not find the ${isFunction ? 'function' : 'variable'} it expected`,
    `${lessonLabel} was looking for ${isFunction ? `a function named \`${expectedIdentifier}\`` : `a variable named \`${expectedIdentifier}\``}, but it could not find one in your code.`,
    [
      `Create ${isFunction ? `a function` : `a variable`} named \`${expectedIdentifier}\`.`,
      'Submit again after the required name appears exactly as the lesson expects.'
    ]
  );
}

function buildNameErrorHint(
  missingIdentifier: string,
  submittedCode: string
): LearnerHint {
  const similar = findIdentifierMatch(missingIdentifier, submittedCode, 'any');

  if (similar) {
    return createHint(
      'name_error',
      'high',
      'Python could not find one of your names',
      `Python tried to use \`${missingIdentifier}\`, but that name does not exist. Your code does contain \`${similar.actual}\`, so this is likely a spelling or capitalization mismatch.`,
      [
        `Decide whether the name should be \`${missingIdentifier}\` or \`${similar.actual}\`, then make it consistent everywhere.`,
        'Submit again after every use of the name matches exactly.'
      ]
    );
  }

  return createHint(
    'name_error',
    'medium',
    'Python could not find one of your names',
    `Python tried to use \`${missingIdentifier}\`, but that name was never defined before it was used.`,
    [
      `Define \`${missingIdentifier}\` before you use it, or fix the spelling if you meant a different name.`,
      'Use the Output tab if you want to see the technical traceback.'
    ]
  );
}

function buildSyntaxHint(message: string): LearnerHint {
  return createHint(
    'syntax_error',
    'high',
    'Python could not read your code',
    `${message} This usually means Python found a missing quote, colon, parenthesis, or another punctuation problem before the program could run.`,
    [
      'Look closely for missing or extra punctuation near the line mentioned in the Output tab.',
      'After fixing the syntax, submit again.'
    ]
  );
}

function buildIndentationHint(message: string): LearnerHint {
  return createHint(
    'indentation_error',
    'high',
    'Python found an indentation problem',
    `${message} Lines inside the same block need to line up exactly in Python.`,
    [
      'Check the spaces at the start of each line in the block that failed.',
      'Make sure lines inside loops, functions, and if-statements are indented consistently.'
    ]
  );
}

function buildDataframeMismatchHint(topic: string, operations: string[]): LearnerHint {
  const step = describeDataframeStep(topic, operations);

  return createHint(
    'dataframe_mismatch',
    'medium',
    'Your DataFrame result did not match the lesson',
    `Your code ran, but the DataFrame it produced while ${step} was different from what the lesson expected.`,
    [
      'Compare the columns, row order, and values in your result.',
      `Recheck the step for ${step} and submit again.`,
      'Open Output if you need the technical comparison details.'
    ]
  );
}

function buildVariableValueMismatchHint(
  identifier: string,
  expected: string,
  received: string,
  lessonLabel: string
): LearnerHint {
  const expectedValue = expected ? `\`${expected}\`` : 'the expected value';
  const receivedValue = received ? `\`${received}\`` : 'a different value';

  return createHint(
    'output_mismatch',
    'high',
    `The variable ${identifier} has the wrong value`,
    `${lessonLabel} found the variable \`${identifier}\`, but its value was ${receivedValue} instead of ${expectedValue}.`,
    [
      `Set \`${identifier}\` to ${expectedValue}.`,
      'Submit again after that variable matches the lesson exactly.',
      'Open Output if you want to see the technical assertion details.'
    ]
  );
}

function buildOutputMismatchHint(): LearnerHint {
  return createHint(
    'output_mismatch',
    'medium',
    'Your program ran, but its result did not match the lesson',
    'Your code finished running, but the final value or printed output was different from what the lesson expected.',
    [
      'Compare the Expected and Actual sections carefully.',
      'Check spelling, spaces, punctuation, and line breaks if the lesson is about printed output.',
      'Open Output if you need the technical test details.'
    ]
  );
}

function extractProgramAssertionIdentifier(diagnosticText: string): string {
  const directMatches = [...diagnosticText.matchAll(
    /assert\s+program\.([A-Za-z_][A-Za-z0-9_]*)\s*(?:==|is(?:\s+not)?)/gi
  )];

  if (directMatches.length > 0) {
    return directMatches[directMatches.length - 1]?.[1] ?? '';
  }

  const whereMatches = [...diagnosticText.matchAll(
    /where\s+.+?\.([A-Za-z_][A-Za-z0-9_]*)\b/gi
  )];

  if (whereMatches.length > 0) {
    return whereMatches[whereMatches.length - 1]?.[1] ?? '';
  }

  return '';
}

function extractAssertionComparisonValues(
  diagnosticText: string
): null | { expected: string; received: string } {
  const equalityMatches = [...diagnosticText.matchAll(
    /AssertionError:[ \t]*assert[ \t]+([^\n]+?)[ \t]*==[ \t]*([^\n]+)/gi
  )];

  if (equalityMatches.length > 0) {
    const equalityMatch = equalityMatches[equalityMatches.length - 1];
    return {
      received: equalityMatch[1].trim(),
      expected: equalityMatch[2].trim(),
    };
  }

  const identityMatches = [...diagnosticText.matchAll(
    /AssertionError:[ \t]*assert[ \t]+([^\n]+?)[ \t]+is[ \t]+([^\n]+)/gi
  )];

  if (identityMatches.length > 0) {
    const identityMatch = identityMatches[identityMatches.length - 1];
    return {
      received: identityMatch[1].trim(),
      expected: identityMatch[2].trim(),
    };
  }

  return null;
}

function resolveComparisonValues(
  detail: FailureDetail,
  diagnosticText: string
): null | { expected: string; received: string } {
  const structured = {
    expected: normalizeInlineValue(detail.expected || ''),
    received: normalizeInlineValue(detail.received || ''),
  };
  const fallback = extractAssertionComparisonValues(diagnosticText);
  const normalizedFallback = fallback
    ? {
      expected: normalizeInlineValue(fallback.expected),
      received: normalizeInlineValue(fallback.received),
    }
    : null;
  const structuredUsable = (
    !isSuspiciousComparisonValue(structured.expected) &&
    !isSuspiciousComparisonValue(structured.received)
  );
  const fallbackUsable = Boolean(
    normalizedFallback &&
    !isSuspiciousComparisonValue(normalizedFallback.expected) &&
    !isSuspiciousComparisonValue(normalizedFallback.received)
  );

  if (fallbackUsable && !structuredUsable) {
    return normalizedFallback;
  }

  if (structuredUsable) {
    return structured;
  }

  if (fallbackUsable) {
    return normalizedFallback;
  }

  if (structured.expected || structured.received) {
    return structured;
  }

  return normalizedFallback;
}

function isLikelyDataframeRuntimeMismatch(diagnosticText: string): boolean {
  return (
    /assert_frame_equal|DataFrame|Series/i.test(diagnosticText) ||
    /has no attribute '(columns|dtypes|shape|index|axes)'/i.test(diagnosticText) ||
    /(columns|index|shape|dtypes) are different/i.test(diagnosticText) ||
    /pandas\/core\/indexes\/base\.py|pandas\/core\/computation\/scope\.py/i.test(diagnosticText) ||
    /\bget_loc\b|UndefinedVariableError|BACKTICK_QUOTED_STRING_/i.test(diagnosticText) ||
    /None of \[Index\(.+\)\] are in the \[columns\]/i.test(diagnosticText) ||
    /KeyError:/i.test(diagnosticText)
  );
}

function buildRuntimeHint(message: string): LearnerHint {
  return createHint(
    'runtime_error',
    'medium',
    'Your code ran into an error while it was being checked',
    message,
    [
      'Read the Output tab to see where the error happened.',
      'Fix that error first, then submit again.'
    ]
  );
}

function buildUnknownHint(): LearnerHint {
  return createHint(
    'unknown',
    'low',
    'The lesson found a problem, but it needs the technical details to explain it',
    'I could not safely turn this failure into a more specific beginner hint yet.',
    [
      'Open the Output tab to see the technical error details.',
      'Focus first on the first error shown there, then submit again.'
    ]
  );
}

function hasAssertionFailure(diagnosticText: string): boolean {
  return /AssertionError\b|Assertion failed:|^\s*assert\b/m.test(diagnosticText);
}

function buildFailureHint(
  detail: FailureDetail,
  context: LearnerHintContext,
  includeRawOutput: boolean
): LearnerHint {
  const contract = extractExerciseContract(context.referenceTest, context.topic, context.title);
  const message = detail.error_message || '';
  const diagnosticText = buildDiagnosticText(detail, includeRawOutput);
  const topicLabel = context.title?.trim() || context.topic?.trim() || 'This lesson';
  const lessonLabel = topicLabel;
  const missingAttributeMatch = diagnosticText.match(/module 'program' has no attribute '([A-Za-z_][A-Za-z0-9_]*)'/);
  const missingImportMatch = diagnosticText.match(
    /ImportError:\s+cannot import name ['"]([A-Za-z_][A-Za-z0-9_]*)['"] from ['"]program['"]/i
  );
  const comparisonValues = resolveComparisonValues(detail, diagnosticText);

  if (missingAttributeMatch || missingImportMatch) {
    const expectedIdentifier = (missingAttributeMatch || missingImportMatch)?.[1] ?? '';
    const isExpectedFunction = contract.expectedFunctions.includes(expectedIdentifier);
    const isExpectedVariable = contract.expectedVariables.includes(expectedIdentifier);

    if (!isExpectedFunction && !isExpectedVariable) {
      return buildRuntimeHint(message || extractFirstMatchingLine(diagnosticText, /ImportError:[^\n]*/i));
    }

    const isFunction = contract.expectedFunctions.includes(expectedIdentifier) &&
      !contract.expectedVariables.includes(expectedIdentifier);

    return buildMissingIdentifierHint(expectedIdentifier, context.submittedCode, lessonLabel, isFunction);
  }

  const assertionMissingIdentifierMatch = diagnosticText.match(
    /There should be a (variable|function) named exactly ([A-Za-z_][A-Za-z0-9_]*)/i
  );

  if (assertionMissingIdentifierMatch) {
    const expectedIdentifier = assertionMissingIdentifierMatch[2];
    const isFunction = assertionMissingIdentifierMatch[1].toLowerCase() === 'function' ||
      (contract.expectedFunctions.includes(expectedIdentifier) &&
        !contract.expectedVariables.includes(expectedIdentifier));

    return buildMissingIdentifierHint(expectedIdentifier, context.submittedCode, lessonLabel, isFunction);
  }

  if (/IndentationError:/i.test(diagnosticText)) {
    return buildIndentationHint(message || extractFirstMatchingLine(diagnosticText, /IndentationError:[^\n]*/i));
  }

  if (/SyntaxError:/i.test(diagnosticText)) {
    return buildSyntaxHint(message || extractFirstMatchingLine(diagnosticText, /SyntaxError:[^\n]*/i));
  }

  if (contract.usesDataframe && isLikelyDataframeRuntimeMismatch(diagnosticText)) {
    return buildDataframeMismatchHint(contract.topic, contract.dataframeOperations);
  }

  const nameErrorMatch = diagnosticText.match(/name '([A-Za-z_][A-Za-z0-9_]*)' is not defined/);
  if (nameErrorMatch) {
    return buildNameErrorHint(nameErrorMatch[1], context.submittedCode);
  }

  if (detail.expected || detail.received) {
    if (contract.usesDataframe) {
      return buildDataframeMismatchHint(contract.topic, contract.dataframeOperations);
    }

    const assertedIdentifier = extractProgramAssertionIdentifier(diagnosticText);
    if (assertedIdentifier && contract.expectedVariables.includes(assertedIdentifier)) {
      return buildVariableValueMismatchHint(
        assertedIdentifier,
        comparisonValues?.expected ?? detail.expected,
        comparisonValues?.received ?? detail.received,
        lessonLabel
      );
    }

    return buildOutputMismatchHint();
  }

  if (/AttributeError:|TypeError:|ValueError:|KeyError:|IndexError:/i.test(diagnosticText)) {
    return buildRuntimeHint(
      message ||
      extractFirstMatchingLine(diagnosticText, /(AttributeError:|TypeError:|ValueError:|KeyError:|IndexError:)[^\n]*/i) ||
      'The lesson reported a runtime error.'
    );
  }

  if (hasAssertionFailure(diagnosticText)) {
    if (contract.usesDataframe) {
      return buildDataframeMismatchHint(contract.topic, contract.dataframeOperations);
    }

    const assertedIdentifier = extractProgramAssertionIdentifier(diagnosticText);
    if (assertedIdentifier && contract.expectedVariables.includes(assertedIdentifier)) {
      const values = extractAssertionComparisonValues(diagnosticText);

      return buildVariableValueMismatchHint(
        assertedIdentifier,
        values?.expected ?? '',
        values?.received ?? '',
        lessonLabel
      );
    }

    return buildOutputMismatchHint();
  }

  return buildUnknownHint();
}

function buildTopLevelHint(evaluation: EvaluationResponse, context: LearnerHintContext): LearnerHint | null {
  const contract = extractExerciseContract(context.referenceTest, context.topic, context.title);

  if (evaluation.execution_time_exceeded) {
    return createHint(
      'timeout',
      'medium',
      'Your code took too long to finish',
      'The lesson stopped your program because it did not finish before the time limit.',
      [
        'Check for loops that never end or code that repeats too much work.',
        'Submit again after your program finishes more quickly.'
      ]
    );
  }

  if (evaluation.failure_details.length > 0) {
    return evaluation.failure_details[0].learner_hint ?? null;
  }

  if (evaluation.compilation_error) {
    return createHint(
      'compile_error',
      'medium',
      'Your code could not be compiled',
      evaluation.compilation_error,
      [
        'Fix the first compiler error shown in Output.',
        'Submit again after the code compiles successfully.'
      ]
    );
  }

  if (evaluation.runtime_error) {
    if (/IndentationError:/i.test(evaluation.runtime_error)) {
      return buildIndentationHint(evaluation.runtime_error);
    }

    if (/SyntaxError:/i.test(evaluation.runtime_error)) {
      return buildSyntaxHint(evaluation.runtime_error);
    }

    if (contract.usesDataframe && isLikelyDataframeRuntimeMismatch(evaluation.runtime_error)) {
      return buildDataframeMismatchHint(contract.topic, contract.dataframeOperations);
    }

    return buildRuntimeHint(evaluation.runtime_error);
  }

  if (evaluation.memory_exceeded) {
    return buildUnknownHint();
  }

  if (evaluation.state === 'passed') {
    return null;
  }

  return buildUnknownHint();
}

function addLearnerHintsToEvaluation(
  evaluation: EvaluationResponse,
  context: LearnerHintContext
): EvaluationResponse {
  const includeRawOutput = evaluation.failure_details.length === 1;
  const failure_details = evaluation.failure_details.map((detail) => ({
    ...detail,
    learner_hint: buildFailureHint(detail, context, includeRawOutput),
  }));

  const hintedEvaluation = {
    ...evaluation,
    failure_details,
  };

  return {
    ...hintedEvaluation,
    learner_hint: buildTopLevelHint(hintedEvaluation, context),
  };
}

export type {
  LearnerHintContext,
};

export {
  addLearnerHintsToEvaluation,
};
