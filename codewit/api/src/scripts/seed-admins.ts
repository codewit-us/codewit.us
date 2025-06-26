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
// 1st e-mail
const primaryAdmin = admins.length > 0 ? admins[0] : null;
// all the rest
const studentEmails = admins.slice(1);

async function seedAdmins() {
  
  // Make sure the first e-mail exists AND is admin
  if (primaryAdmin) {
    const [user] = await User.findOrCreate({
      where: { email: primaryAdmin },
      defaults: { isAdmin: true },
    });

    if (!user.isAdmin) {
      await user.update({ isAdmin: true });
    }
  }

  // Create ALL remaining e-mails as *non-admin* users
  for (const email of studentEmails) {
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: { isAdmin: false },
    });
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
