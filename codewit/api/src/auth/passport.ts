import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
} from '../secrets';
import { User } from '../models';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_REDIRECT_URL,
      scope: ['email', 'profile'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      const user = await User.findOne({ where: { googleId: profile.id } });

      if (!user) {
        const newUser = await User.create({
          username: profile.displayName,
          email: profile.emails?.[0].value,
          googleId: profile.id,
        });

        done(null, newUser);
      } else {
        done(null, user);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.uid);
});

passport.deserializeUser(async (id: number, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});
