type LessonFamily =
  | 'variable'
  | 'function'
  | 'console_io'
  | 'dataframe'
  | 'general';

interface ExerciseContract {
  topic: string;
  title: string;
  lessonFamily: LessonFamily;
  expectedVariables: string[];
  expectedFunctions: string[];
  expectedImports: string[];
  usesConsoleOutput: boolean;
  usesInput: boolean;
  usesDataframe: boolean;
  dataframeOperations: string[];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function stripQuotedStrings(input: string): string {
  return input
    .replace(/"""[\s\S]*?"""/g, ' ')
    .replace(/'''[\s\S]*?'''/g, ' ')
    .replace(/"([^"\\]|\\.)*"/g, ' ')
    .replace(/'([^'\\]|\\.)*'/g, ' ');
}

function collectMatches(input: string, regex: RegExp): string[] {
  return unique([...input.matchAll(regex)].map((match) => match[1]?.trim() ?? ''));
}

function normalizeTopic(topic?: string | null): string {
  return (topic ?? '').trim().toLowerCase();
}

function detectDataframeOperations(referenceTest: string, normalizedTopic: string): string[] {
  const operations = new Set<string>();

  if (/\bread_(csv|excel|json|parquet)\s*\(/i.test(referenceTest) || normalizedTopic.includes('load dataframe')) {
    operations.add('load_dataframe');
  }

  if (/\.describe\s*\(/i.test(referenceTest) || normalizedTopic.includes('describe dataframe')) {
    operations.add('describe_dataframe');
  }

  if (/\.query\s*\(/i.test(referenceTest) || normalizedTopic.includes('query dataframe')) {
    operations.add('query_dataframe');
  }

  if (/(?:^|[^A-Za-z_])(?:pd\.)?melt\s*\(|\.melt\s*\(/i.test(referenceTest) || normalizedTopic.includes('melt dataframe')) {
    operations.add('melt_dataframe');
  }

  if (/(?:pivot_table|\.pivot\s*\(|\.pivot_table\s*\()/i.test(referenceTest) || normalizedTopic.includes('pivot dataframe')) {
    operations.add('pivot_dataframe');
  }

  return [...operations];
}

function detectLessonFamily(normalizedTopic: string, expectedFunctions: string[], usesConsoleOutput: boolean, usesDataframe: boolean): LessonFamily {
  if (usesDataframe) {
    return 'dataframe';
  }

  if (normalizedTopic === 'console io') {
    return 'console_io';
  }

  if (normalizedTopic === 'function' || expectedFunctions.length > 0) {
    return 'function';
  }

  if (normalizedTopic === 'variable') {
    return 'variable';
  }

  return 'general';
}

function extractImportedIdentifiers(referenceTest: string): string[] {
  const imported = collectMatches(referenceTest, /from\s+program\s+import\s+([^\n]+)/g);
  const importedNames = imported.flatMap((group) => group.split(','))
    .map((part) => part.trim().replace(/\s+as\s+.+$/, ''))
    .filter(Boolean);

  return unique(importedNames);
}

function extractHasattrIdentifiers(referenceTest: string): string[] {
  return collectMatches(referenceTest, /hasattr\s*\(\s*program\s*,\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g);
}

function extractAliasedProgramFunctions(referenceTest: string): string[] {
  const aliases = [...referenceTest.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*=\s*program\.([A-Za-z_][A-Za-z0-9_]*)\b/g)];
  const expectedFunctions = aliases
    .filter((match) => {
      const alias = match[1];
      return new RegExp(`\\b${alias}\\s*\\(`).test(referenceTest);
    })
    .map((match) => match[2]?.trim() ?? '');

  return unique(expectedFunctions);
}

function extractExerciseContract(
  referenceTest: string,
  topic?: string | null,
  title?: string | null
): ExerciseContract {
  const structuralReferenceTest = stripQuotedStrings(referenceTest);
  const normalizedTopic = normalizeTopic(topic);
  const directProgramFunctionCalls = collectMatches(structuralReferenceTest, /program\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/g);
  const aliasedProgramFunctions = extractAliasedProgramFunctions(structuralReferenceTest);
  const importedIdentifiers = extractImportedIdentifiers(referenceTest);
  const importedFunctions = importedIdentifiers.filter(
    (identifier) => new RegExp(`\\b${identifier}\\s*\\(`).test(structuralReferenceTest)
  );
  const expectedFunctions = unique([
    ...directProgramFunctionCalls,
    ...aliasedProgramFunctions,
    ...importedFunctions,
  ]);
  const expectedVariables = unique([
    ...collectMatches(structuralReferenceTest, /program\.([A-Za-z_][A-Za-z0-9_]*)\b(?!\s*\()/g),
    ...extractHasattrIdentifiers(referenceTest),
  ])
    .filter((identifier) => !expectedFunctions.includes(identifier));
  const usesConsoleOutput = /(capsys|captured\.out|stdout|print\s*\()/i.test(referenceTest);
  const usesInput = /\binput\s*\(|monkeypatch\.setattr.*input/i.test(referenceTest);
  const dataframeOperations = detectDataframeOperations(referenceTest, normalizedTopic);
  const usesDataframe = dataframeOperations.length > 0 || /pandas|DataFrame|assert_frame_equal|Series/i.test(referenceTest);

  return {
    topic: topic ?? '',
    title: title ?? '',
    lessonFamily: detectLessonFamily(normalizedTopic, expectedFunctions, usesConsoleOutput, usesDataframe),
    expectedVariables: unique([...expectedVariables, ...importedIdentifiers.filter((identifier) => !expectedFunctions.includes(identifier))]),
    expectedFunctions,
    expectedImports: importedIdentifiers,
    usesConsoleOutput,
    usesInput,
    usesDataframe,
    dataframeOperations,
  };
}

export type {
  ExerciseContract,
  LessonFamily,
};

export {
  extractExerciseContract,
};
