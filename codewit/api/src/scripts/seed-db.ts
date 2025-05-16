import { User, Course, Demo, Exercise, Module, Resource, Tag, Language, sequelize } from '../models';
import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .option('-e, --email <email>', 'Create general data with the given email')
  .parse(process.argv);

const options = program.opts();
const email = options.email || '';

// student names for the roster
const studentNames = [
  "Alexandria Virginia",
  "Bella Sophia",
  "Cletus Spuckler",
  "Duffman",
  "Edna Krabappel",
  "Fat Tony",
  "Groundskeeper Willie",
  "Homer Simpson",
  "Itchy",
  "Jimbo Jones",
  "Krusty The Clown",
  "Lisa Simpson",
  "Marge Simpson",
  "Nelson Muntz",
  "Otto Mann",
  "Patty Bouvier",
  "Queen Reina",
  "Ralph Wiggum",
  "Snake Jailbird",
  "Troy McClure",
];


const nameToEmail = (fullName: string): string => {
  return fullName.toLowerCase().replace(/[^a-z]/g, '') + '@gmail.com';
}

const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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

  const studentUsers = await Promise.all(studentNames.map(async (name) => {
    const email = nameToEmail(name);
    const [student] = await User.findOrCreate({
      where: { email },
      defaults: {
        username: name,
        isAdmin: false,
      },
    });
    return student;
  }));

  const moduleTopics = [
    'variable', 'object', 'decision', 'boolean expression', 'while loop',
    'for loop', 'array', 'array list', 'multidimensional array', 'modularity', 'recursion'
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
        youtube_thumbnail: 'https://i.ytimg.com/vi/XxBWL_ntnNE/maxresdefault.jpg',
        topic: topic,
      });

      // add language to demo
      const [language] = await Language.findOrCreate({
        where: { name: 'cpp' },
      });
      await demo.setLanguage(language);

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

      // add tags to the exercise
      const exerciseTag = await Tag.findOrCreate({
        where: { name: `${topic.toLowerCase()}-exercise` }
      }).then(([tag]) => tag);

      await exercise.addTag(exerciseTag);

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

    // create additional resources for each module
    const additionalResources = await Promise.all([1, 2].map(async (num) => {
      return await Resource.create({
        url: `https://example.com/${topic.toLowerCase().replace(' ', '-')}-${num}`,
        title: `${topic} Extra Resource ${num}`,
        source: 'Documentation'
      });
    }));

    // associate multiple resources with module
    await module.setResources([resources[index], ...additionalResources]);

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
  await course.setRoster([...studentUsers, user]);

  console.log('Created course:', course.title);
  console.log('Created modules:', moduleTopics.length);
  console.log('Created demos:', moduleTopics.length * 3);
  console.log('Created exercises:', moduleTopics.length * 3);
  console.log('Created resources:', resources.length + moduleTopics.length * 2);
  console.log('Created users:', studentUsers.length + 1); // +1 for the instructor
};

(async () => {
    if (options.force) {
      await sequelize.sync({ force: true });
      console.log('Force syncing database');
    }
  
    await seedData();
    console.log('Database seeded!');
  })();
  
