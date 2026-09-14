import { extractExerciseContract } from './exerciseContract';

describe('extractExerciseContract', () => {
  it('detects variable expectations from lesson tests', () => {
    const contract = extractExerciseContract(
      `
import program

def test_hat_variables():
    assert program.numberOfHats == 9
      `.trim(),
      'variable',
      'Collecting Hats'
    );

    expect(contract.lessonFamily).toBe('variable');
    expect(contract.expectedVariables).toContain('numberOfHats');
    expect(contract.expectedFunctions).toHaveLength(0);
  });

  it('detects variable expectations from hasattr checks', () => {
    const contract = extractExerciseContract(
      `
import sys

def test_hat_variables():
    sys.modules.pop("program", None)
    import program
    assert hasattr(program, "HatName")
      `.trim(),
      'variable',
      'Collecting Hats'
    );

    expect(contract.lessonFamily).toBe('variable');
    expect(contract.expectedVariables).toContain('HatName');
    expect(contract.expectedFunctions).toHaveLength(0);
  });

  it('detects aliased program functions from live lesson tests', () => {
    const contract = extractExerciseContract(
      `
import sys

def test_choose_clothes_function_variants():
    sys.modules.pop("program", None)
    import program
    f = program.chooes_clothes
    assert f("weds") == {"shirt": "pink"}
      `.trim(),
      'function',
      'Wardrobe rules'
    );

    expect(contract.lessonFamily).toBe('function');
    expect(contract.expectedFunctions).toContain('chooes_clothes');
    expect(contract.expectedVariables).not.toContain('chooes_clothes');
  });

  it('classifies called identifiers imported from program as functions only', () => {
    const contract = extractExerciseContract(
      `
from program import calculateTotal

def test_total():
    assert calculateTotal() == 3
      `.trim(),
      'function',
      'Calculate a total'
    );

    expect(contract.expectedFunctions).toContain('calculateTotal');
    expect(contract.expectedVariables).not.toContain('calculateTotal');
  });

  it('classifies uncalled identifiers imported from program as variables only', () => {
    const contract = extractExerciseContract(
      `
from program import numberOfHats

def test_hats():
    assert numberOfHats == 9
      `.trim(),
      'variable',
      'Collecting Hats'
    );

    expect(contract.expectedVariables).toContain('numberOfHats');
    expect(contract.expectedFunctions).not.toContain('numberOfHats');
  });

  it('detects dataframe operations and expected functions', () => {
    const contract = extractExerciseContract(
      `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_load_dataframe():
    expected = pd.read_csv('world_cup.csv')
    result = program.loadWorldCupData()
    assert_frame_equal(result, expected)
      `.trim(),
      'load dataframe',
      'Load World cup data'
    );

    expect(contract.lessonFamily).toBe('dataframe');
    expect(contract.usesDataframe).toBe(true);
    expect(contract.expectedFunctions).toContain('loadWorldCupData');
    expect(contract.dataframeOperations).toContain('load_dataframe');
  });

  it('detects console io lessons from production-style tests', () => {
    const contract = extractExerciseContract(
      `
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
    expected_output = "What song would you like to add\\n"
    assert captured == expected_output
      `.trim(),
      'console io',
      'Song Request'
    );

    expect(contract.lessonFamily).toBe('console_io');
    expect(contract.usesInput).toBe(true);
    expect(contract.usesConsoleOutput).toBe(true);
  });

  [
    {
      topic: 'describe dataframe',
      title: 'Statistics of hair product data',
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
      operation: 'describe_dataframe',
      expectedFunction: 'describeHairProducts',
    },
    {
      topic: 'query dataframe',
      title: 'Search hair product data',
      referenceTest: `
import pandas as pd
from pandas.testing import assert_frame_equal
import program

def test_query_dataframe():
    source = pd.read_csv('./datasets/hair.csv')
    expected = source.query("Brand == 'Eco Style'")
    result = program.searchHairProducts()
    assert_frame_equal(result, expected)
      `.trim(),
      operation: 'query_dataframe',
      expectedFunction: 'searchHairProducts',
    },
    {
      topic: 'melt dataframe',
      title: 'Unpivot hair data',
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
      operation: 'melt_dataframe',
      expectedFunction: 'unpivotHairData',
    },
    {
      topic: 'pivot dataframe',
      title: 'Pivot hair product data',
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
      operation: 'pivot_dataframe',
      expectedFunction: 'pivotHairProducts',
    },
  ].forEach(({ topic, title, referenceTest, operation, expectedFunction }) => {
    it(`detects dataframe operation ${operation} for ${title}`, () => {
      const contract = extractExerciseContract(referenceTest, topic, title);

      expect(contract.lessonFamily).toBe('dataframe');
      expect(contract.usesDataframe).toBe(true);
      expect(contract.dataframeOperations).toContain(operation);
      expect(contract.expectedFunctions).toContain(expectedFunction);
    });
  });

  describe('regression cases', () => {
    it('detects lowercase snake_case variable expectations from player stat lessons', () => {
      const contract = extractExerciseContract(
        `
import sys

def test_player_name():
    sys.modules.pop("program", None)
    import program
    assert program.player_name == "Coolminivan"

def test_is_player_on():
    assert program.is_player_on is True

def test_level_player():
    assert program.level_player == 64
    assert isinstance(program.level_player, int)
        `.trim(),
        'variable',
        'Player Stats'
      );

      expect(contract.lessonFamily).toBe('variable');
      expect(contract.expectedVariables).toEqual(
        expect.arrayContaining(['player_name', 'is_player_on', 'level_player'])
      );
    });

    it('detects printed-output lessons that do not use input', () => {
      const contract = extractExerciseContract(
        `
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
        'math operation',
        'Road Trip Math'
      );

      expect(contract.lessonFamily).toBe('general');
      expect(contract.usesConsoleOutput).toBe(true);
      expect(contract.usesInput).toBe(false);
    });

    it('detects printed dataframe lessons from topic metadata even without assert_frame_equal', () => {
      const contract = extractExerciseContract(
        `
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
        'describe dataframe',
        'Statistics of hair product data'
      );

      expect(contract.lessonFamily).toBe('dataframe');
      expect(contract.usesDataframe).toBe(true);
      expect(contract.usesConsoleOutput).toBe(true);
      expect(contract.dataframeOperations).toContain('describe_dataframe');
    });

    it('does not treat program.py file references as an expected learner variable', () => {
      const contract = extractExerciseContract(
        `
import importlib
import sys
import os
import pytest

def test_program_output(capsys):
    if not os.path.exists("./datasets/worldcup.csv"):
        pytest.skip("Dataset not found; skipping test")

    sys.modules.pop("program", None)
    import program
    importlib.reload(program)

    out = capsys.readouterr().out.strip()
    assert out, "No output printed from program.py"
    assert "RUNNER UP" in out
        `.trim(),
        'load dataframe',
        'World Cup Load Dataframe'
      );

      expect(contract.lessonFamily).toBe('dataframe');
      expect(contract.usesDataframe).toBe(true);
      expect(contract.expectedVariables).not.toContain('py');
    });
  });
});
