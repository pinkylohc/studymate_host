import type { NextAuthConfig } from "next-auth"

import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials"


import { getUserByEmail } from "@/db/user";    
import bcrypt from "bcryptjs";

export default { 
    providers: [

    GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,

    }),

    GithubProvider({
        clientId:process.env.GITHUB_CLIENT_ID,
        clientSecret:process.env.GITHUB_CLIENT_SECRET,
    }),

    Credentials({
        
        credentials: {
            email: {},
            password: {},
          },

          authorize: async (credentials) => {
            if (credentials === null) return;

            const user = await getUserByEmail(credentials.email as string);

            if (user){
                const isMatch =  await bcrypt.compare(credentials.password as string, user.password);

                if (isMatch){
                    return user;
                } else{
                    return;
                }
            }  else{
                return;
            }    
          },

    }),
],

} satisfies NextAuthConfig