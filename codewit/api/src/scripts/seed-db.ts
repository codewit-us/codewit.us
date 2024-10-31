import { User, Course, Demo, Exercise, Module, Resource, sequelize } from '../models';
import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .option('-e, --email <email>', 'Create general data with the given email')
  .parse(process.argv);

const options = program.opts();
const email = options.email || '';

const seedData = async () => {

  // See if the user exists
  let user = await User.findOne({ where: { email } });

  // If the user does not exist, create them
  if (!user) {
    user = await User.create({
      email,
      isAdmin: true,
    });
  }

  // Create General Data


}


(async () => {
    if (options.force) {
      await sequelize.sync({ force: true });
      console.log('Force syncing database');
    }
  
    await seedData();
    console.log('Database seeded!');
  })();
  