import { User, sequelize } from '../models';

/*
Add admin emails to this array to seed the database with admin users.
example:
const admins = [
  'kbuffardi@mail.csuchico.edu',
  'kbuffardi@csuchico.edu'
];
*/
const admins = [];

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
  // read args to see if we should force sync
  const args = process.argv;
  const force = args.includes('--force');

  if (force) {
    await sequelize.sync({ force: true });
    console.log('Force syncing database');
  }

  await seedAdmins();
  console.log('Admins seeded');

  const admins = await User.findAll({ where: { isAdmin: true } });

  console.log(
    'Admins:\n',
    admins.map((admin) => admin)
  );
})();
