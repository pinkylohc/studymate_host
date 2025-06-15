"use server"

import { signOut } from "@/auth"


export default async function signOutUser() {
  await signOut({redirectTo: "/auth/login"});
}