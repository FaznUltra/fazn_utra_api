declare module 'passport-twitch' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: any,
        refreshToken: any,
        profile: any,
        done: any
      ) => void
    );
  }
}
