import { User, Course, Demo, Exercise, Module, Resource, Tag, Language, sequelize } from '../models';
import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .option('-e, --email <email>', 'Create general data with the given email')
  .parse(process.argv);

const options = program.opts();
const email = options.email || '';

const studentNames = [
  "Alexandria Virginia", "Bella Sophia", "Cletus Spuckler", "Duffman",
  "Edna Krabappel", "Fat Tony", "Groundskeeper Willie", "Homer Simpson",
  "Itchy", "Jimbo Jones", "Krusty The Clown", "Lisa Simpson",
  "Marge Simpson", "Nelson Muntz", "Otto Mann", "Patty Bouvier",
  "Queen Reina", "Ralph Wiggum", "Snake Jailbird", "Troy McClure"
];

// -------- Generators for C++, Python, Java Tests -------- //

const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1).replace(/\s+/g, '');
};

const generateCppTest = (topic: string) => {
  const suiteName = `${capitalize(topic)}TestSuite`;
  let tests = '';
  switch (topic.toLowerCase()) {
    case 'variable':
      tests = `
    void testVariableAssignment() {
        TS_ASSERT_EQUALS(getVariable(), 5);
    }
    void testVariableUpdate() {
        TS_ASSERT_EQUALS(updateVariable(10), 15);
    }`;
      break;
    case 'array':
      tests = `
    void testArrayFirstElement() {
        TS_ASSERT_EQUALS(getArrayFirstElement(), 1);
    }
    void testArraySum() {
        TS_ASSERT_EQUALS(sumArray(), 6);
    }`;
      break;
    case 'recursion':
      tests = `
    void testFactorialOf3() {
        TS_ASSERT_EQUALS(factorial(3), 6);
    }
    void testFactorialOf5() {
        TS_ASSERT_EQUALS(factorial(5), 120);
    }`;
      break;
    case 'boolean expression':
      tests = `
    void testBooleanAnd() {
        TS_ASSERT_EQUALS(booleanAnd(true, false), false);
    }
    void testBooleanOr() {
        TS_ASSERT_EQUALS(booleanOr(true, false), true);
    }`;
      break;
    case 'for loop':
      tests = `
    void testForLoopSum() {
        TS_ASSERT_EQUALS(forLoopSum(5), 15);
    }`;
      break;
    case 'while loop':
      tests = `
    void testWhileLoopDecrement() {
        TS_ASSERT_EQUALS(whileLoopDecrement(5), 0);
    }`;
      break;
    case 'object':
      tests = `
    void testPointCoordinates() {
        TS_ASSERT_EQUALS(getPointX(), 3);
        TS_ASSERT_EQUALS(getPointY(), 4);
    }`;
      break;
    case 'modularity':
      tests = `
    void testAddFunction() {
        TS_ASSERT_EQUALS(add(2, 3), 5);
    }`;
      break;
    case 'multidimensional array':
      tests = `
    void testMatrixElement() {
        TS_ASSERT_EQUALS(getMatrixElement(), 4);
    }`;
      break;
    case 'array list':
      tests = `
    void testVectorPushBack() {
        TS_ASSERT_EQUALS(getVectorFirstElement(), 10);
    }`;
      break;
    default:
      tests = `
    void testPlaceholder() {
        TS_ASSERT(true);
    }`;
      break;
  }
  return `
#include <cxxtest/TestSuite.h>

class ${suiteName} : public CxxTest::TestSuite {
public:${tests}
};
`.trim();
};

const generatePythonTest = (topic: string) => {
  let importLines = [];
  let tests = '';

  switch (topic.toLowerCase()) {
    case 'variable':
      importLines = ['getVariable', 'updateVariable'];
      tests = `
def test_get_variable():
    assert getVariable() == 5

def test_update_variable():
    assert updateVariable(10) == 15
`.trim();
      break;
    case 'array':
      importLines = ['getArrayFirstElement', 'sumArray'];
      tests = `
def test_get_array_first_element():
    assert getArrayFirstElement() == 1

def test_sum_array():
    assert sumArray() == 6
`.trim();
      break;
    case 'recursion':
      importLines = ['factorial'];
      tests = `
def test_factorial_3():
    assert factorial(3) == 6

def test_factorial_5():
    assert factorial(5) == 120
`.trim();
      break;
    case 'boolean expression':
      importLines = ['booleanAnd', 'booleanOr'];
      tests = `
def test_boolean_and():
    assert booleanAnd(True, False) == False

def test_boolean_or():
    assert booleanOr(True, False) == True
`.trim();
      break;
    case 'for loop':
      importLines = ['forLoopSum'];
      tests = `
def test_for_loop_sum():
    assert forLoopSum(5) == 15
`.trim();
      break;
    case 'while loop':
      importLines = ['whileLoopDecrement'];
      tests = `
def test_while_loop_decrement():
    assert whileLoopDecrement(5) == 0
`.trim();
      break;
    case 'object':
      importLines = ['getPointX', 'getPointY'];
      tests = `
def test_get_point_x():
    assert getPointX() == 3

def test_get_point_y():
    assert getPointY() == 4
`.trim();
      break;
    case 'modularity':
      importLines = ['add'];
      tests = `
def test_add_function():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0
`.trim();
      break;
    case 'multidimensional array':
      importLines = ['getMatrixElement'];
      tests = `
def test_matrix_element():
    assert getMatrixElement() == 4
`.trim();
      break;
    case 'array list':
      importLines = ['getVectorFirstElement'];
      tests = `
def test_vector_push_back():
    assert getVectorFirstElement() == 10
`.trim();
      break;
    default:
      importLines = [];
      tests = `
def test_placeholder():
    assert True
`.trim();
      break;
  }

  const imports = `import pytest\nfrom program import ${importLines.join(', ')}`;

  return `${imports}\n\n${tests}`;
};

const generateJavaTest = (topic: string) => {
  switch (topic.toLowerCase()) {
    case 'variable':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testGetVariable() {
        assertEquals(5, Program.getVariable());
    }
    @Test
    public void testUpdateVariable() {
        assertEquals(15, Program.updateVariable(10));
    }
}
`.trim();
    case 'array':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testGetArrayFirstElement() {
        assertEquals(1, Program.getArrayFirstElement());
    }
    @Test
    public void testSumArray() {
        assertEquals(6, Program.sumArray());
    }
}
`.trim();
    case 'recursion':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testFactorial3() {
        assertEquals(6, Program.factorial(3));
    }
    @Test
    public void testFactorial5() {
        assertEquals(120, Program.factorial(5));
    }
}
`.trim();
    case 'boolean expression':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testBooleanAnd() {
        assertEquals(false, Program.booleanAnd(true, false));
    }
    @Test
    public void testBooleanOr() {
        assertEquals(true, Program.booleanOr(true, false));
    }
}
`.trim();
    case 'for loop':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testForLoopSum() {
        assertEquals(15, Program.forLoopSum(5));
    }
}
`.trim();
    case 'while loop':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testWhileLoopDecrement() {
        assertEquals(0, Program.whileLoopDecrement(5));
    }
}
`.trim();
    case 'object':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testGetPointX() {
        assertEquals(3, Program.getPointX());
    }
    @Test
    public void testGetPointY() {
        assertEquals(4, Program.getPointY());
    }
}
`.trim();
    case 'modularity':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testAddFunction() {
        assertEquals(5, Program.add(2, 3));
    }
}
`.trim();
    case 'multidimensional array':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testMatrixElement() {
        assertEquals(4, Program.getMatrixElement());
    }
}
`.trim();
    case 'array list':
      return `
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testVectorPushBack() {
        assertEquals(10, Program.getVectorFirstElement());
    }
}
`.trim();
    default:
      return `
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class TestProgram {
    @Test
    public void testPlaceholder() {
        assertTrue(true);
    }
}
`.trim();
  }
};

function generateJavaStarterCode(topic: string): string {
  switch (topic.toLowerCase()) {
    case 'variable':
      return `public class Program {
    public static int getVariable() {
    }
    public static int updateVariable(int x) {

    }
}`;
    case 'array':
      return `public class Program {
    public static int getArrayFirstElement() {

    }
    public static int sumArray() {

    }
}`;
    case 'recursion':
      return `public class Program {
    public static int factorial(int n) {
    }
}`;
    case 'boolean expression':
      return `public class Program {
    public static boolean booleanAnd(boolean a, boolean b) {
    }
    public static boolean booleanOr(boolean a, boolean b) {
    }
}`;
    case 'for loop':
      return `public class Program {
    public static int forLoopSum(int n) {
    }
}`;
    case 'while loop':
      return `public class Program {
    public static int whileLoopDecrement(int n) {
    }
}`;
    case 'object':
      return `public class Program {
    public static int getPointX() {
    }
    public static int getPointY() {
    }
}`;
    case 'modularity':
      return `public class Program {
    public static int add(int a, int b) {
    }
}`;
    case 'multidimensional array':
      return `public class Program {
    public static int getMatrixElement() {
    }
}`;
    case 'array list':
      return `public class Program {
    public static int getVectorFirstElement() {
    }
}`;
    default:
      return `public class Program {
    public static boolean testPlaceholder() {
    }
}`;
  }
};

// ---------------------------------------- //
// Main Seeder
// ---------------------------------------- //

const seedData = async () => {
  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({ email, isAdmin: true });
  }

  const studentUsers = await Promise.all(studentNames.map(async (name) => {
    const email = name.toLowerCase().replace(/[^a-z]/g, '') + '@gmail.com';
    const [student] = await User.findOrCreate({
      where: { email },
      defaults: { username: name, isAdmin: false },
    });
    return student;
  }));

  const moduleTopics = [
    'variable', 'object', 'decision', 'boolean expression', 'while loop',
    'for loop', 'array', 'array list', 'multidimensional array', 'modularity', 'recursion'
  ];

  const languages = {
    cpp: await Language.findOrCreate({ where: { name: 'cpp' } }).then(([lang]) => lang),
    python: await Language.findOrCreate({ where: { name: 'python' } }).then(([lang]) => lang),
    java: await Language.findOrCreate({ where: { name: 'java' } }).then(([lang]) => lang),
  };

  const languageConfigs = [
    { lang: 'cpp', generateTest: generateCppTest, generateStarterCode: null },
    { lang: 'python', generateTest: generatePythonTest, generateStarterCode: null },
    { lang: 'java', generateTest: generateJavaTest, generateStarterCode: generateJavaStarterCode },
  ];

  for (const { lang, generateTest, generateStarterCode } of languageConfigs) {
    const language = languages[lang];

    console.log(`Creating course for ${lang}...`);

    const [course] = await Course.findOrCreate({
      where: { id: `ap-comp-sci-${lang}` },
      defaults: {
        title: `Open AP Computer Science ${lang.toUpperCase()}`,
      }
    });
    await course.setLanguage(language);

    const modules = await Promise.all(moduleTopics.map(async (topic, index) => {
      const demos = await Promise.all([1, 2, 3].map(async (num) => {
        const demo = await Demo.create({
          title: `${topic} Demo ${num} (${lang.toUpperCase()})`,
          youtube_id: 'XxBWL_ntnNE',
          youtube_thumbnail: 'https://i.ytimg.com/vi/XxBWL_ntnNE/maxresdefault.jpg',
          topic: topic,
        });

        await demo.setLanguage(language.uid);

        await demo.addTag(
          await Tag.findOrCreate({ where: { name: topic.toLowerCase() } }).then(([tag]) => tag),
          { through: { ordering: 1 } }
        );

        const exercise = await Exercise.create({
          prompt: `Complete the ${topic} exercise ${num} (${lang.toUpperCase()})`,
          topic: topic,
          referenceTest: generateTest(topic),
          languageUid: language.uid,
          starterCode: generateStarterCode?.(topic),
        });

        const exerciseTag = await Tag.findOrCreate({ where: { name: `${topic.toLowerCase()}-exercise` } }).then(([tag]) => tag);
        await exercise.addTag(exerciseTag);
        await demo.addExercise(exercise);

        return demo;
      }));

      const module = await Module.create({ topic: topic });
      await module.setLanguage(language.uid);
      await module.setDemos(demos);

      const mainResource = await Resource.findOrCreate({
        where: { url: `https://example.com/${topic.toLowerCase().replace(' ', '-')}` },
        defaults: {
          title: `${topic} Tutorial`,
          source: 'Documentation'
        }
      }).then(([resource]) => resource);

      const additionalResources = await Promise.all([1, 2].map(async (num) => {
        return await Resource.create({
          url: `https://example.com/${topic.toLowerCase().replace(' ', '-')}-${num}`,
          title: `${topic} Extra Resource ${num}`,
          source: 'Documentation'
        });
      }));

      await module.setResources([mainResource, ...additionalResources]);

      return module;
    }));

    await Promise.all(modules.map(async (module, idx) => {
      await course.addModule(module, { through: { ordering: idx + 1 } });
    }));

    await course.addInstructor(user);
    await course.setRoster([...studentUsers, user]);

    console.log(`Created course: ${course.title}`);
    console.log('Created modules:', moduleTopics.length);
    console.log('Created demos:', moduleTopics.length * 3);
    console.log('Created exercises:', moduleTopics.length * 3);
    console.log('Created users:', studentUsers.length + 1);
  }

  console.log('Finished creating courses for all languages.');
};

(async () => {
  if (options.force) {
    await sequelize.sync({ force: true });
    console.log('Force syncing database');
  }
  await seedData();
  console.log('Database seeded!');
})();