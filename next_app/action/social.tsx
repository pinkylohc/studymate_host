"use server"

import { signIn } from "@/auth"

export default async function signInWithProvider(provider: string) {
  await signIn(provider, {redirectTo: "/dashboard"});

}
