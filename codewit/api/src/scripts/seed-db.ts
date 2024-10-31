import { User, Course, Demo, Exercise, Module, Resource, Tag, Language, sequelize } from '../models';
import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .option('-e, --email <email>', 'Create general data with the given email')
  .parse(process.argv);

const options = program.opts();
const email = options.email || '';

const seedData = async () => {
  // see if the user exists
  let user = await User.findOne({ where: { email } });

  // if the user does not exist, create them
  if (!user) {
    user = await User.create({
      email,
      isAdmin: true,
    });
  }

  const moduleTopics = [
    'Variables', 'Objects', 'Decisions', 'Boolean Logic', 'While Loops',
    'For Loops', 'Arrays', 'ArrayLists', '2D Arrays', 'Inheritance', 'Recursion'
  ];

  // create resources (we'll create one per module)
  const resources = await Promise.all(moduleTopics.map(async (topic) => {
    return await Resource.create({
      url: `https://example.com/${topic.toLowerCase().replace(' ', '-')}`,
      title: `${topic} Tutorial`,
      source: 'Documentation'
    });
  }));

  // create modules with demos and exercises
  const modules = await Promise.all(moduleTopics.map(async (topic, index) => {
    // create 3 demos for each module
    const demos = await Promise.all([1, 2, 3].map(async (num) => {
      const demo = await Demo.create({
        title: `${topic} Demo ${num}`,
        youtube_id: 'XxBWL_ntnNE',
        topic: topic,
      });

      // add tags to demo
      await demo.addTag(
        await Tag.findOrCreate({ 
          where: { name: topic.toLowerCase() }
        }).then(([tag]) => tag),
        { through: { ordering: 1 } }
      );

      // create one exercise per demo
      const exercise = await Exercise.create({
        prompt: `Complete the ${topic} exercise ${num}`,
        topic: topic,
        referenceTest: 'test.assertEquals(solution(), expected);'
      });

      await demo.addExercise(exercise);

      return demo;
    }));

    // create module and associate demos
    const module = await Module.create({
      topic: topic
    });

    // set language for module
    const [language] = await Language.findOrCreate({
      where: { name: 'cpp' }
    });
    await module.setLanguage(language);

    // associate demos with module
    await module.setDemos(demos);

    // associate resource with module
    await module.setResources([resources[index]]);

    return module;
  }));

  // create the course
  const course = await Course.create({
    title: 'Open AP Computer Science',
    id: 'ap-comp-sci'
  });

  // set course language
  const [language] = await Language.findOrCreate({
    where: { name: 'cpp' }
  });
  await course.setLanguage(language);

  // add modules to course
  await Promise.all(modules.map(async (module, idx) => {
    await course.addModule(module, {
      through: { ordering: idx + 1 }
    });
  }));

  // add user as both instructor and roster member
  await course.addInstructor(user);
  await course.setRoster([user]);

  console.log('Created course:', course.title);
  console.log('Created modules:', moduleTopics.length);
  console.log('Created demos:', moduleTopics.length * 3);
  console.log('Created exercises:', moduleTopics.length * 3);
  console.log('Created resources:', resources.length);
};

(async () => {
    if (options.force) {
      await sequelize.sync({ force: true });
      console.log('Force syncing database');
    }
  
    await seedData();
    console.log('Database seeded!');
  })();
  
