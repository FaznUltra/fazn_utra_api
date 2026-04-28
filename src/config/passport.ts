import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitchStrategy } from 'passport-twitch';
import User from '../models/User';
import { UserRole } from '../types';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/api/oauth/google/callback',
        scope: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/youtube.readonly'
        ]
      },
    async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error('No email found from Google'), undefined);
        }

        let user = await User.findOne({
          $or: [
            { email },
            { 'oauthProviders.google.id': profile.id }
          ]
        });

        if (user) {
          if (!user.oauthProviders?.google) {
            user.oauthProviders = {
              ...user.oauthProviders,
              google: {
                id: profile.id,
                email
              }
            };
            user.isEmailVerified = true;
            await user.save();
          }
        } else {
          const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
          let uniqueUsername = username;
          let counter = 1;

          while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          user = await User.create({
            email,
            firstName: profile.name?.givenName || 'User',
            lastName: profile.name?.familyName || '',
            username: uniqueUsername,
            role: UserRole.USER,
            isEmailVerified: true,
            oauthProviders: {
              google: {
                id: profile.id,
                email
              }
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
} else {
  console.warn('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required');
}

if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
  passport.use(
    new TwitchStrategy(
      {
        clientID: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        callbackURL: process.env.TWITCH_CALLBACK_URL || 'http://localhost:8000/api/oauth/twitch/callback',
        scope: 'user:read:email'
      },
    async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
      try {
        const email = profile.email;
        const twitchUsername = profile.login;

        if (!email) {
          return done(new Error('No email found from Twitch'), undefined);
        }

        let user = await User.findOne({
          $or: [
            { email },
            { 'oauthProviders.twitch.id': profile.id }
          ]
        });

        if (user) {
          if (!user.oauthProviders?.twitch) {
            user.oauthProviders = {
              ...user.oauthProviders,
              twitch: {
                id: profile.id,
                username: twitchUsername
              }
            };
            user.streamingAccounts = {
              ...user.streamingAccounts,
              twitch: {
                username: twitchUsername,
                channelId: profile.id,
                isVerified: true,
                verifiedAt: new Date()
              }
            };
            user.isEmailVerified = true;
            await user.save();
          }
        } else {
          const username = twitchUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          let uniqueUsername = username;
          let counter = 1;

          while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          user = await User.create({
            email,
            firstName: profile.display_name || twitchUsername,
            lastName: '',
            username: uniqueUsername,
            role: UserRole.USER,
            isEmailVerified: true,
            oauthProviders: {
              twitch: {
                id: profile.id,
                username: twitchUsername
              }
            },
            streamingAccounts: {
              twitch: {
                username: twitchUsername,
                channelId: profile.id,
                isVerified: true,
                verifiedAt: new Date()
              }
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
} else {
  console.warn('⚠️  Twitch OAuth not configured - TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET required');
}

export default passport;
