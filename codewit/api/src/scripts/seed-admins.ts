import { User, sequelize } from '../models';
import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .option('-f, --force', 'Force sync the database')
  .option('-a, --admin <emails...>', 'Add admin emails')
  .parse(process.argv);

const options = program.opts();
const admins = options.admin || [];

async function seedAdmins() {
  for (const email of admins) {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      await User.create({
        email,
        isAdmin: true,
      });
    }

    if (user && !user.isAdmin) {
      await user.update({ isAdmin: true });
    }
  }
}

(async () => {
  if (options.force) {
    await sequelize.sync({ force: true });
    console.log('Force syncing database');
  }

  await seedAdmins();
  console.log('Admins seeded');

  const adminUsers = await User.findAll({ where: { isAdmin: true } });

  console.log(
    'Admins:\n',
    adminUsers.map((admin) => admin.email)
  );
})();
