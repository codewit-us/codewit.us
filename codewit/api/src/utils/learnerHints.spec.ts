import type { EvaluationResponse } from './codeEvalService';
import { addLearnerHintsToEvaluation } from './learnerHints';

const collectingHatsReferenceTest = `
import sys

def test_hat_variables():
    sys.modules.pop("program", None)
    import program
    assert hasattr(program,"HatName"), "There should be a variable named exactly HatName"
    assert program.HatName == "Veracruz"
    assert hasattr(program,"NumberOfHats"), "There should be a variable named exactly NumberOfHats"
    assert program.NumberOfHats == 9
    assert hasattr(program,"CostOfHats"), "There should be a variable named exactly CostOfHats"
    assert program.CostOfHats == 278.91
    assert hasattr(program,"WearingHat"), "There should be a variable named exactly WearingHat"
    assert program.WearingHat is False
`.trim();

describe('addLearnerHintsToEvaluation', () => {
  it('builds a high-confidence variable mismatch hint from the lesson test', () => {
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
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import program

def test_hat_variables():
    assert program.numberOfHats == 9
      `.trim(),
      submittedCode: 'NumberOfHats = int(9)',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('name_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('numberOfHats');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('NumberOfHats');
    expect(hinted.learner_hint?.title).toContain('variable name');
  });

  it('builds a dataframe hint for dataframe assertion mismatches', () => {
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
          test_case: 'test_pivot_result',
          expected: 'expected frame',
          received: 'actual frame',
          error_message: 'Assertion failed: assert_frame_equal(result, expected)',
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_pivot_result():
    expected = pd.DataFrame({'a': [1]})
    result = program.buildPivotTable()
    assert_frame_equal(result, expected)
      `.trim(),
      submittedCode: 'def buildPivotTable():\n    return df',
      topic: 'pivot dataframe',
      title: 'Pivot the standings table',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('dataframe_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('DataFrame');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('pivot');
  });

  it('builds a variable name hint from assertion-style lesson messages', () => {
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
          error_message: 'AssertionError: There should be a variable named exactly HatName',
          rawout: `
=================================== FAILURES ===================================
______________________________ test_hat_variables ______________________________

>       assert hasattr(program,"HatName"), "There should be a variable named exactly HatName"
E       AssertionError: There should be a variable named exactly HatName
          `.trim(),
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import sys

def test_hat_variables():
    sys.modules.pop("program", None)
    import program
    assert hasattr(program,"HatName"), "There should be a variable named exactly HatName"
      `.trim(),
      submittedCode: 'hatName = "Veracruz"',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('name_mismatch');
    expect(hinted.failure_details[0].learner_hint?.title).toContain('variable name');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('HatName');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('hatName');
  });

  it('builds a format-based variable name hint when underscores are added', () => {
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
          error_message: "AttributeError: module 'program' has no attribute 'NumberOfHats'",
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import program

def test_hat_variables():
    assert program.NumberOfHats == 9
      `.trim(),
      submittedCode: 'Number_Of_Hats = 9',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('name_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('NumberOfHats');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('Number_Of_Hats');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('underscores');
  });

  it('builds a capitalization hint for a different expected variable name', () => {
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
          error_message: "AttributeError: module 'program' has no attribute 'CostOfHats'",
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: collectingHatsReferenceTest,
      submittedCode: 'costOfHats = float(278.91)',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('name_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('CostOfHats');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('costOfHats');
  });

  it('builds a missing variable hint when the name is absent entirely', () => {
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
          error_message: "AttributeError: module 'program' has no attribute 'WearingHat'",
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import program

def test_hat_variables():
    assert program.WearingHat is False
      `.trim(),
      submittedCode: 'HatName = "Veracruz"\nNumberOfHats = 9\nCostOfHats = 278.91',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('missing_variable');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('WearingHat');
  });

  [
    {
      identifier: 'HatName',
      expected: '"Veracruz"',
      received: '"Oaxaca"',
      errorMessage: 'Assertion failed: assert program.HatName == "Veracruz"',
      submittedCode: 'HatName = str("Oaxaca")\nNumberOfHats = int(9)\nCostOfHats = float(278.91)\nWearingHat = bool(False)',
    },
    {
      identifier: 'NumberOfHats',
      expected: '9',
      received: '8',
      errorMessage: 'Assertion failed: assert program.NumberOfHats == 9',
      submittedCode: 'HatName = str("Veracruz")\nNumberOfHats = int(8)\nCostOfHats = float(278.91)\nWearingHat = bool(False)',
    },
    {
      identifier: 'CostOfHats',
      expected: '278.91',
      received: '199.99',
      errorMessage: 'Assertion failed: assert program.CostOfHats == 278.91',
      submittedCode: 'HatName = str("Veracruz")\nNumberOfHats = int(9)\nCostOfHats = float(199.99)\nWearingHat = bool(False)',
    },
    {
      identifier: 'WearingHat',
      expected: 'False',
      received: 'True',
      errorMessage: 'Assertion failed: assert program.WearingHat is False',
      submittedCode: 'HatName = str("Veracruz")\nNumberOfHats = int(9)\nCostOfHats = float(278.91)\nWearingHat = bool(True)',
    },
  ].forEach(({ identifier, expected, received, errorMessage, submittedCode }) => {
    it(`builds a specific variable-value hint when ${identifier} has the wrong asserted value`, () => {
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
            expected,
            received,
            error_message: errorMessage,
            rawout: 'technical traceback',
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: collectingHatsReferenceTest,
        submittedCode,
        topic: 'variable',
        title: 'Collecting Hats',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
      expect(hinted.failure_details[0].learner_hint?.title).toContain(identifier);
      expect(hinted.failure_details[0].learner_hint?.summary).toContain(`\`${identifier}\``);
      expect(hinted.failure_details[0].learner_hint?.summary).toContain(`\`${received}\``);
      expect(hinted.failure_details[0].learner_hint?.summary).toContain(`\`${expected}\``);
    });
  });

  it('builds a variable-specific value hint from raw pytest assertion text when expected and received are missing', () => {
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
          error_message: "AssertionError: assert 'WRONG' == 'Veracruz'",
          rawout: `
=================================== FAILURES ===================================
______________________________ test_hat_variables ______________________________

>       assert program.HatName == "Veracruz"
E       AssertionError: assert 'WRONG' == 'Veracruz'
          `.trim(),
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: collectingHatsReferenceTest,
      submittedCode: 'HatName = "WRONG"',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.title).toContain('HatName');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`HatName`');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain("`'WRONG'`");
    expect(hinted.failure_details[0].learner_hint?.summary).toContain("`'Veracruz'`");
  });

  it('prefers raw pytest assertion values when structured comparison fields are noisy', () => {
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
          expected: '======================= 1 failed, 3 passed in 0.01s ==========================',
          received: 'True is False',
          error_message: 'AssertionError: assert True is False',
          rawout: `
=================================== FAILURES ===================================
______________________________ test_hat_variables ______________________________

>       assert program.WearingHat is False
E       AssertionError: assert True is False
          `.trim(),
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: collectingHatsReferenceTest,
      submittedCode: 'HatName = "Veracruz"\nNumberOfHats = 9\nCostOfHats = 278.91\nWearingHat = True',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.title).toContain('WearingHat');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`True`');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`False`');
    expect(hinted.failure_details[0].learner_hint?.summary).not.toContain('1 failed, 3 passed');
  });

  it('builds the value hint for the failing variable in multi-assert traceback output', () => {
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
          error_message: 'AssertionError: assert 0 == 9',
          rawout: `
=================================== FAILURES ===================================
______________________________ test_hat_variables ______________________________

    def test_hat_variables():
        assert program.HatName == "Veracruz"
>       assert program.NumberOfHats == 9
E       AssertionError: assert 0 == 9
E        +  where 0 = <module 'program'>.NumberOfHats
          `.trim(),
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: collectingHatsReferenceTest,
      submittedCode: 'HatName = "Veracruz"\nNumberOfHats = 0',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.title).toContain('NumberOfHats');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`NumberOfHats`');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`0`');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`9`');
  });

  it('builds a generic output mismatch hint from pytest diff-style assertion output', () => {
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
          test_case: 'test_funkos_list_operations',
          expected: '',
          received: '',
          error_message: '+ WRONG OUTPUT',
          rawout: `
=================================== FAILURES ===================================
_________________________ test_funkos_list_operations __________________________

>       assert out == expected
E       assert "actual" == "expected"
E         + WRONG OUTPUT

test_program.py:15: AssertionError
          `.trim(),
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import sys

def test_funkos_list_operations(capsys):
    sys.modules.pop("program", None)
    import program
    out = capsys.readouterr().out
    expected = "expected"
    assert out == expected
      `.trim(),
      submittedCode: 'print("actual")',
      topic: 'array list',
      title: 'Funkos',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('printed output');
  });

  it('builds a function hint for aliased program function checks', () => {
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
          test_case: 'test_choose_clothes_function_variants',
          expected: '',
          received: '',
          error_message: "AttributeError: module 'program' has no attribute 'chooes_clothes'",
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import sys

def test_choose_clothes_function_variants():
    sys.modules.pop("program", None)
    import program
    f = program.chooes_clothes
    assert f("weds") == {'shoes': 'pink'}
      `.trim(),
      submittedCode: 'shirt = "pink"',
      topic: 'function',
      title: 'Wardrobe rules',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('missing_function');
    expect(hinted.failure_details[0].learner_hint?.title).toContain('function');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('chooes_clothes');
  });

  it('builds an output mismatch hint for console input/output lessons', () => {
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
          test_case: 'test_song_request',
          expected: 'What song would you like to add\\nI heard that Hello is a good song\\n',
          received: 'Hello\\n',
          error_message: 'Assertion failed: assert captured == expected_output',
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
from pytest import MonkeyPatch
import builtins
import sys

def run_program_with(monkeypatch, inputs):
    monkeypatch.setattr(builtins, "input", lambda _=None: next(inputs))
    sys.modules.pop("program", None)
    import program

def test_song_request(monkeypatch, capsys):
    user_input = iter(["Hello"])
    run_program_with(monkeypatch, user_input)
    captured = capsys.readouterr().out
    expected_output = (
        "What song would you like to add \\n"
        "I heard that Hello is a good song\\n"
    )
    assert captured == expected_output
      `.trim(),
      submittedCode: 'song = input()\\nprint(song)',
      topic: 'console io',
      title: 'Song Request',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('printed output');
    expect(hinted.failure_details[0].learner_hint?.next_steps.join(' ')).toContain('line breaks');
  });

  it('builds a generic output mismatch hint for boolean expression lessons', () => {
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
          test_case: 'test_points_low_branch',
          expected: 'Keep practicing\n',
          received: 'All-star\n',
          error_message: 'Assertion failed: assert captured == expected_output',
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
from pytest import MonkeyPatch
import builtins
import sys

def run_program_with(monkeypatch, inputs):
    monkeypatch.setattr(builtins, "input", lambda _=None: next(inputs))
    sys.modules.pop("program", None)
    import program

def test_points_low_branch(monkeypatch, capsys):
    user_input = iter(["8"])
    run_program_with(monkeypatch, user_input)
    captured = capsys.readouterr().out
    expected_output = "Keep practicing\\n"
    assert captured == expected_output
      `.trim(),
      submittedCode: 'points = int(input())\nprint("All-star")',
      topic: 'boolean expression',
      title: 'Basketball',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('printed output');
  });

  it('builds a generic output mismatch hint for for-loop lessons', () => {
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
          test_case: 'test_budgeting_total',
          expected: '[50, 25, 15]',
          received: '[50, 25]',
          error_message: 'Assertion failed: assert result == expected',
          rawout: 'technical traceback',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: `
import sys
sys.modules.pop("program", None)
import program

def test_budgeting_total():
    result = program.build_budget_list()
    expected = [50, 25, 15]
    assert result == expected
      `.trim(),
      submittedCode: 'def build_budget_list():\n    return [50, 25]',
      topic: 'for loop',
      title: 'Budgeting',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('final value');
  });

  [
    {
      title: 'Load hair product data',
      topic: 'load dataframe',
      summarySnippet: 'loading the DataFrame',
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_load_dataframe():
    expected = pd.read_csv('./datasets/hair.csv')
    result = program.loadHairProductData()
    assert_frame_equal(result, expected)
      `.trim(),
      submittedCode: 'import pandas as pd\ndef loadHairProductData():\n    return pd.DataFrame()',
    },
    {
      title: 'Statistics of hair product data',
      topic: 'describe dataframe',
      summarySnippet: 'describing the DataFrame',
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_describe_dataframe():
    source = pd.read_csv('./datasets/hair.csv')
    expected = source.describe()
    result = program.describeHairProducts()
    assert_frame_equal(result, expected)
      `.trim(),
      submittedCode: 'import pandas as pd\ndef describeHairProducts():\n    return pd.DataFrame()',
    },
    {
      title: 'Search hair product data',
      topic: 'query dataframe',
      summarySnippet: 'querying the DataFrame',
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_query_dataframe():
    source = pd.read_csv('./datasets/hair.csv')
    expected = source.query(\"Brand == 'Eco Style'\")
    result = program.searchHairProducts()
    assert_frame_equal(result, expected)
      `.trim(),
      submittedCode: 'import pandas as pd\ndef searchHairProducts():\n    return pd.DataFrame()',
    },
    {
      title: 'Unpivot hair data',
      topic: 'melt dataframe',
      summarySnippet: 'melting the DataFrame',
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_melt_dataframe():
    source = pd.read_csv('./datasets/hair.csv')
    expected = pd.melt(source, id_vars=['Brand'])
    result = program.unpivotHairData()
    assert_frame_equal(result, expected)
      `.trim(),
      submittedCode: 'import pandas as pd\ndef unpivotHairData():\n    return pd.DataFrame()',
    },
    {
      title: 'Pivot hair product data',
      topic: 'pivot dataframe',
      summarySnippet: 'pivoting the DataFrame',
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_pivot_dataframe():
    source = pd.read_csv('./datasets/hair.csv')
    expected = source.pivot_table(index='Brand', values='Price', aggfunc='mean')
    result = program.pivotHairProducts()
    assert_frame_equal(result, expected)
      `.trim(),
      submittedCode: 'import pandas as pd\ndef pivotHairProducts():\n    return pd.DataFrame()',
    },
  ].forEach(({ title, topic, summarySnippet, referenceTest, submittedCode }) => {
    it(`builds a dataframe mismatch hint for ${title}`, () => {
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
            test_case: 'test_dataframe_result',
            expected: 'expected frame',
            received: 'actual frame',
            error_message: 'Assertion failed: assert_frame_equal(result, expected)',
            rawout: 'technical traceback',
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest,
        submittedCode,
        topic,
        title,
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('dataframe_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain(summarySnippet);
    });
  });

  describe('regression cases', () => {
    it('builds a variable name hint for lowercase snake_case lessons', () => {
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
            test_case: 'test_player_name',
            expected: '',
            received: '',
            error_message: "AttributeError: module 'program' has no attribute 'player_name'",
            rawout: 'technical traceback',
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: `
import sys

def test_player_name():
    sys.modules.pop("program", None)
    import program
    assert program.player_name == "Coolminivan"

def test_is_player_on():
    assert program.is_player_on is True
      `.trim(),
        submittedCode: 'playerName = "Coolminivan"\nis_player_on = True\nlevel_player = int(64)\nhealth_player = 2.5',
        topic: 'variable',
        title: 'Player Stats',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('name_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('player_name');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('playerName');
    });

    it('builds an output mismatch hint for no-input print lessons', () => {
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
            test_case: 'test_outputs_no_input',
            expected: '480\n285\n405\n2.7857142857142856\n9\n9\n',
            received: '480\n285\n405\n2.7857142857142856\n9\n8\n',
            error_message: 'Assertion failed: assert out == expected',
            rawout: 'technical traceback',
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: `
import sys

def test_outputs_no_input(capsys):
    sys.modules.pop("program", None)
    import program
    out = capsys.readouterr().out
    expected = (
        "480\\n"
        "285\\n"
        "405\\n"
        "2.7857142857142856\\n"
        "9\\n"
        "9\\n"
    )
    assert out == expected
      `.trim(),
        submittedCode: `
gallons = 12
avg_miles = 40
distance_home = 195
speed = 70
total_miles = gallons * avg_miles
print(total_miles)
print(total_miles - distance_home)
print((total_miles - distance_home) + (3 * 40))
print(195 / 70)
print(3 ** 2)
print(pow(2, 3))
        `.trim(),
        topic: 'math operation',
        title: 'Road Trip Math',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('output_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('printed output');
    });

    it('builds a dataframe hint for printed dataframe lessons without explicit expected and received values', () => {
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
            test_case: 'test_describe_printed',
            expected: '',
            received: '',
            error_message: "AssertionError: Expected 'count' in output, got:",
            rawout: "Assertion failed: assert 'count' in out",
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: `
import importlib
import sys

def test_describe_printed(capsys):
    sys.modules.pop("program", None)
    import program
    importlib.reload(program)
    out = capsys.readouterr().out.strip()
    expected_parts = ["count", "mean", "std", "min", "max"]
    for part in expected_parts:
        assert part in out, f"Expected '{part}' in output, got:\\n{out}"
      `.trim(),
        submittedCode: `
import pandas as pd

hair_products = pd.read_csv("../datasets/hair.csv")
print(hair_products["Y_2019"].head())
        `.trim(),
        topic: 'describe dataframe',
        title: 'Statistics of hair product data',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('dataframe_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('describing the DataFrame');
    });

    it('builds a dataframe mismatch hint when a dataframe lesson returns the wrong object type', () => {
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
            test_case: 'test_world_cup_query',
            expected: '',
            received: '',
            error_message: "AttributeError: 'str' object has no attribute 'columns'",
            rawout: "AttributeError: 'str' object has no attribute 'columns'",
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_world_cup_query():
    expected = pd.DataFrame({'CHAMPION': ['Italy']})
    assert_frame_equal(program.WC, expected)
        `.trim(),
        submittedCode: 'WC = "wrong"',
        topic: 'query dataframe',
        title: 'World Cup Query',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('dataframe_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('DataFrame');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('querying the DataFrame');
    });

    it('builds a dataframe mismatch hint when pandas query evaluation raises a name error', () => {
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
            test_case: 'test_query_players',
            expected: '',
            received: '',
            error_message: "name 'BACKTICK_QUOTED_STRING_Top_Player' is not defined",
            rawout: `
======================= ERROR collecting test_program.py =======================
/usr/lib/python3.11/site-packages/pandas/core/computation/scope.py:232: in resolve
    return self.temps[key]
E   KeyError: 'BACKTICK_QUOTED_STRING_Top_Player'
            `.trim(),
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: `
import pandas as pd
import program

def test_query_players():
    result = program.df.query('\`Top Player\` == "A.Judge" or \`Top Player\` == "B.Ruth"')
    assert isinstance(result, pd.DataFrame)
        `.trim(),
        submittedCode: 'df = {"Top Player": "wrong"}',
        topic: 'query dataframe',
        title: 'Search Baseball data',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('dataframe_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('querying the DataFrame');
    });

    it('builds a dataframe mismatch hint when dataframe columns are missing', () => {
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
            test_case: 'test_worldcup_describe',
            expected: '',
            received: '',
            error_message: `KeyError: "None of [Index(['TEAMS', 'MATCHES PLAYED', 'GOALS SCORED'], dtype='str')] are in the [columns]"`,
            rawout: `
_______________________ ERROR collecting test_program.py _______________________
test_program.py:2: in <module>
    desc = program.world_cup[["TEAMS", "MATCHES PLAYED", "GOALS SCORED"]]
            `.trim(),
          }
        ],
        compilation_error: '',
        runtime_error: '',
        execution_time_exceeded: false,
        memory_exceeded: false,
      };

      const hinted = addLearnerHintsToEvaluation(evaluation, {
        referenceTest: `
import pandas as pd
import program

def test_worldcup_describe():
    desc = program.world_cup[["TEAMS", "MATCHES PLAYED", "GOALS SCORED"]]
    assert isinstance(desc, pd.DataFrame)
        `.trim(),
        submittedCode: 'world_cup = pd.DataFrame({"WRONG": [0]})',
        topic: 'describe dataframe',
        title: 'Statistics of World cup data',
      });

      expect(hinted.failure_details[0].learner_hint?.kind).toBe('dataframe_mismatch');
      expect(hinted.failure_details[0].learner_hint?.summary).toContain('describing the DataFrame');
    });
  });

  it('builds a syntax hint from traceback text when the lesson only returns raw output', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [
        {
          test_case: 'pytest collection',
          expected: '',
          received: '',
          error_message: '',
          rawout: 'SyntaxError: invalid syntax',
        }
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'def test_program():\n    pass',
      submittedCode: 'print("hello"',
      topic: 'console io',
      title: 'Song Request',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('syntax_error');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('invalid syntax');
  });

  it('keeps identifiers and values scoped to each Codeval failure detail', () => {
    const rawout = `
=================================== FAILURES ===================================
_________________________________ test_hats ___________________________________
>       assert program.NumberOfHats == 9
E       assert 8 == 9
________________________________ test_shirts __________________________________
>       assert program.NumberOfShirts == 4
E       assert 2 == 4
    `.trim();
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 2,
      passed: 0,
      failed: 2,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [
        {
          test_case: 'test_hats',
          expected: '9',
          received: '8',
          error_message: 'Assertion failed: assert program.NumberOfHats == 9',
          diagnostic: '>       assert program.NumberOfHats == 9\nE       assert 8 == 9',
          rawout,
        },
        {
          test_case: 'test_shirts',
          expected: '4',
          received: '2',
          error_message: 'Assertion failed: assert program.NumberOfShirts == 4',
          diagnostic: '>       assert program.NumberOfShirts == 4\nE       assert 2 == 4',
          rawout,
        },
      ],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: [
        'import program',
        'def test_hats():',
        '    assert program.NumberOfHats == 9',
        'def test_shirts():',
        '    assert program.NumberOfShirts == 4',
      ].join('\n'),
      submittedCode: 'NumberOfHats = 8\nNumberOfShirts = 2',
      topic: 'variable',
      title: 'Clothing inventory',
    });

    expect(hinted.failure_details[0].learner_hint?.title).toContain('NumberOfHats');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`8`');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('`9`');
    expect(hinted.failure_details[1].learner_hint?.title).toContain('NumberOfShirts');
    expect(hinted.failure_details[1].learner_hint?.summary).toContain('`2`');
    expect(hinted.failure_details[1].learner_hint?.summary).toContain('`4`');
  });

  it('classifies missing functions imported from program', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      no_tests_collected: false,
      exit_code: 2,
      failure_details: [{
        test_case: 'pytest collection',
        expected: '',
        received: '',
        error_message: "ImportError: cannot import name 'calculateTotal' from 'program' (/tmp/program.py)",
        diagnostic: "ImportError: cannot import name 'calculateTotal' from 'program' (/tmp/program.py)",
        rawout: 'pytest collection output',
      }],
      compilation_error: '',
      runtime_error: "ImportError: cannot import name 'calculateTotal' from 'program' (/tmp/program.py)",
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'from program import calculateTotal\n\ndef test_total():\n    assert calculateTotal() == 3',
      submittedCode: 'def calculate_total():\n    return 3',
      topic: 'function',
      title: 'Calculate a total',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('name_mismatch');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('calculate_total');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('calculateTotal');
  });

  it('classifies missing variables imported from program', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      no_tests_collected: false,
      exit_code: 2,
      failure_details: [{
        test_case: 'pytest collection',
        expected: '',
        received: '',
        error_message: "ImportError: cannot import name 'numberOfHats' from 'program' (/tmp/program.py)",
        diagnostic: "ImportError: cannot import name 'numberOfHats' from 'program' (/tmp/program.py)",
        rawout: 'pytest collection output',
      }],
      compilation_error: '',
      runtime_error: "ImportError: cannot import name 'numberOfHats' from 'program' (/tmp/program.py)",
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'from program import numberOfHats\n\ndef test_hats():\n    assert numberOfHats == 9',
      submittedCode: 'hatCount = 9',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('missing_variable');
    expect(hinted.failure_details[0].learner_hint?.summary).toContain('numberOfHats');
  });

  it('ignores near-match names that appear only in comments and strings', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 1,
      passed: 0,
      failed: 1,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [{
        test_case: 'test_hats',
        expected: '',
        received: '',
        error_message: "AttributeError: module 'program' has no attribute 'numberOfHats'",
        diagnostic: "AttributeError: module 'program' has no attribute 'numberOfHats'",
        rawout: 'pytest output',
      }],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'import program\n\ndef test_hats():\n    assert program.numberOfHats == 9',
      submittedCode: [
        '# NumberOfHats = 9',
        'message = "NumberOfHats = 9"',
        "notes = '''",
        'NumberOfHats = 9',
        "'''",
      ].join('\n'),
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('missing_variable');
  });

  it('ignores near-match module names bound only inside a function', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 1,
      passed: 0,
      failed: 1,
      errors: 0,
      no_tests_collected: false,
      exit_code: 1,
      failure_details: [{
        test_case: 'test_hats',
        expected: '',
        received: '',
        error_message: "AttributeError: module 'program' has no attribute 'numberOfHats'",
        diagnostic: "AttributeError: module 'program' has no attribute 'numberOfHats'",
        rawout: 'pytest output',
      }],
      compilation_error: '',
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'import program\n\ndef test_hats():\n    assert program.numberOfHats == 9',
      submittedCode: 'def helper():\n    NumberOfHats = 9\n    return NumberOfHats',
      topic: 'variable',
      title: 'Collecting Hats',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('missing_variable');
  });

  it('ignores near-match module functions defined only inside a class', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      no_tests_collected: false,
      exit_code: 2,
      failure_details: [{
        test_case: 'pytest collection',
        expected: '',
        received: '',
        error_message: "ImportError: cannot import name 'calculateTotal' from 'program' (/tmp/program.py)",
        diagnostic: "ImportError: cannot import name 'calculateTotal' from 'program' (/tmp/program.py)",
        rawout: 'pytest output',
      }],
      compilation_error: '',
      runtime_error: "ImportError: cannot import name 'calculateTotal' from 'program' (/tmp/program.py)",
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'from program import calculateTotal\n\ndef test_total():\n    assert calculateTotal() == 3',
      submittedCode: 'class Calculator:\n    def calculate_total(self):\n        return 3',
      topic: 'function',
      title: 'Calculate a total',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('missing_function');
  });

  it('prioritizes a structured timeout over partial pytest failures', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 1,
      passed: 0,
      failed: 1,
      errors: 0,
      no_tests_collected: false,
      exit_code: null,
      failure_details: [{
        test_case: 'test_first',
        expected: '1',
        received: '0',
        error_message: 'Assertion failed: assert program.value == 1',
        diagnostic: '>       assert program.value == 1\nE       assert 0 == 1',
        rawout: 'partial pytest output',
      }],
      compilation_error: '',
      runtime_error: 'Execution timed out',
      execution_time_exceeded: true,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'import program\n\ndef test_first():\n    assert program.value == 1',
      submittedCode: 'value = 0\nwhile True:\n    pass',
      topic: 'variable',
      title: 'Timeout',
    });

    expect(hinted.learner_hint?.kind).toBe('timeout');
  });

  it('does not classify import failures from other modules as missing lesson names', () => {
    const evaluation: EvaluationResponse = {
      state: 'failed',
      tests_run: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      no_tests_collected: false,
      exit_code: 2,
      failure_details: [{
        test_case: 'pytest collection',
        expected: '',
        received: '',
        error_message: "ImportError: cannot import name 'DataFrame' from 'pandas'",
        diagnostic: "ImportError: cannot import name 'DataFrame' from 'pandas'",
        rawout: 'pytest collection output',
      }],
      compilation_error: '',
      runtime_error: "ImportError: cannot import name 'DataFrame' from 'pandas'",
      execution_time_exceeded: false,
      memory_exceeded: false,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'import program\n\ndef test_value():\n    assert program.value == 1',
      submittedCode: 'value = 1',
      topic: 'variable',
      title: 'Value',
    });

    expect(hinted.failure_details[0].learner_hint?.kind).toBe('unknown');
  });

  it('does not claim a memory limit was enforced from an unsupported flag', () => {
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
      runtime_error: '',
      execution_time_exceeded: false,
      memory_exceeded: true,
    };

    const hinted = addLearnerHintsToEvaluation(evaluation, {
      referenceTest: 'def test_program():\n    pass',
      submittedCode: '',
      topic: 'variable',
      title: 'Value',
    });

    expect(hinted.learner_hint?.kind).toBe('unknown');
    expect(hinted.learner_hint?.summary).not.toMatch(/memory/i);
  });
});
