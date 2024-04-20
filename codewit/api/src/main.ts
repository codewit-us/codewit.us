import express from 'express';
import { sequelize } from './models';
import demoRouter from './routes/demo';
import exerciseRouter from './routes/exercise';
import moduleRouter from './routes/module';
import resourceRouter from './routes/resource';
import courseRouter from './routes/course';
import authrouter from './routes/auth';
import passport from 'passport';
import session from 'express-session';
import { COOKIE_KEY, HOST, PORT } from './secrets';
import './auth/passport';
import checkAuth from './middleware/auth';

const app = express();

app.use(
  session({
    secret: COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.set('view engine', 'ejs');

app.get('/web', (req, res) => {
  res.render('home', { user: req.user });
});

app.get('/web/login', (req, res) => {
  if (req.user) return res.redirect('/web/profile');

  res.render('login');
});

app.get('/web/profile', checkAuth, (req, res) => {
  res.render('profile', { user: req.user });
});

app.use('/oauth2', authrouter);
app.use('/demos', demoRouter);
app.use('/exercises', exerciseRouter);
app.use('/modules', moduleRouter);
app.use('/resources', resourceRouter);
app.use('/courses', courseRouter);

app.listen(PORT, HOST, async () => {
  await sequelize.sync({ force: false });
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});
