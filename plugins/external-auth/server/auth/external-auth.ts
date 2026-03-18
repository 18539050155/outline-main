import passport from "@outlinewiki/koa-passport";
import type { Context } from "koa";
import Router from "koa-router";
import type { Profile } from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import accountProvisioner from "@server/commands/accountProvisioner";
import passportMiddleware from "@server/middlewares/passport";
import { User } from "@server/models";
import type { AuthenticationResult } from "@server/types";
import {
  StateStore,
  getTeamFromContext,
  getClientFromOAuthState,
  getUserFromOAuthState,
} from "@server/utils/passport";
import config from "../../plugin.json";
import env from "../env";

const router = new Router();

const scopes = ["openid", "profile", "email"];

type ExternalAuthProfile = Profile & {
  email: string;
  displayName: string;
  photos: Array<{ value: string }>;
  _json: {
    email: string;
    name: string;
    picture?: string;
  };
};

if (env.EXTERNAL_AUTH_CLIENT_ID && env.EXTERNAL_AUTH_CLIENT_SECRET) {
  passport.use(
    new OAuth2Strategy(
      {
        clientID: env.EXTERNAL_AUTH_CLIENT_ID,
        clientSecret: env.EXTERNAL_AUTH_CLIENT_SECRET,
        authorizationURL: env.EXTERNAL_AUTH_AUTHORIZATION_URL,
        tokenURL: env.EXTERNAL_AUTH_TOKEN_URL,
        callbackURL: `${env.URL}/auth/${config.id}.callback`,
        passReqToCallback: true,
        store: new StateStore(),
        scope: scopes,
      },
      async function (
        context: Context,
        accessToken: string,
        refreshToken: string,
        params: { expires_in: number; scope?: string },
        profile: ExternalAuthProfile,
        done: (
          err: Error | null,
          user: User | null,
          result?: AuthenticationResult
        ) => void
      ) {
        try {
          const team = await getTeamFromContext(context);
          const client = getClientFromOAuthState(context);
          const existingUser = await getUserFromOAuthState(context);

          // Fetch user info from external system
          const userInfo = await fetch(env.EXTERNAL_AUTH_USER_INFO_URL, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }).then((res) => res.json());

          const result = await accountProvisioner({
            teamId: team?.id,
            email: userInfo.email || profile.email,
            name: userInfo.name || profile.displayName,
            avatarUrl: userInfo.picture || profile.photos?.[0]?.value,
            authenticationProvider: config.id,
            authenticationId: profile.id,
            existingUser,
            client,
          });

          done(null, result.user, result);
        } catch (err) {
          done(err as Error, null);
        }
      }
    )
  );
}

// Authentication routes
router.get(
  `/auth/${config.id}`,
  passportMiddleware,
  passport.authenticate(config.id, {
    prompt: "select_account",
  })
);

router.get(
  `/auth/${config.id}.callback`,
  passportMiddleware,
  passport.authenticate(config.id, {
    failureRedirect: "/login",
  }),
  (ctx) => {
    const result = ctx.state.auth as AuthenticationResult;
    if (result?.redirectTo) {
      ctx.redirect(result.redirectTo);
    } else {
      ctx.redirect("/");
    }
  }
);

export default router;