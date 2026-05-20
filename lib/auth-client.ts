import { polarClient } from "@polar-sh/better-auth";
import {createAuthClient} from "better-auth/react";

export const {signIn, signUp, useSession, signOut} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins:[polarClient()]
})