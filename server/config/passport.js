const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          let username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
          const exists = await User.findOne({ username });
          if (exists) username += '_' + Date.now().toString().slice(-4);

          user = await User.create({
            username,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            email: profile.emails?.[0]?.value || '',
            password: Math.random().toString(36),
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

console.log('✅ Google Passport strategy registered');