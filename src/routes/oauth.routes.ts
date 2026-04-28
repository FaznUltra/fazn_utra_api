import { Router } from 'express';
import passport from '../config/passport';
import { googleCallback, twitchCallback } from '../controllers/oauth.controller';

const router = Router();

router.get('/google', passport.authenticate('google', { session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }),
  googleCallback
);

router.get('/twitch', passport.authenticate('twitch', { session: false }));

router.get(
  '/twitch/callback',
  passport.authenticate('twitch', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=twitch_auth_failed` }),
  twitchCallback
);

export default router;
