import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "@neondatabase/serverless"
import authConfig from "./auth.config"
import { getUserById } from "./db/user"

export const { handlers, auth, signIn, signOut } = NextAuth(() => {

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })

    return{
        adapter: PostgresAdapter(pool),
        session: {strategy: "jwt"},
        
        pages:{
            signIn: "/auth/login",
            error:"auth/login",
        },

        events:{
            async linkAccount({ user }){
              await pool.query('UPDATE users SET "emailVerified" = NOW() WHERE id = $1', [user.id]);      }
          },

        ...authConfig,

        callbacks:{
            async signIn ({ user, account}){
              //console.log({user, account});
              // allow oauth without email verification
              if (account?.provider !== "credentials") return true;
      
              const existingUser = await getUserById(user.id as string);
      
              // prevent sign in without email verification
              if (!existingUser.emailVerified){ return false;}
      
              return true;
      
            },
      
      
            async session ({token, session}){
              //console.log({sessionT: token, session});
      
              if (token.sub && session.user){
                  session.user.id = token.sub;
              }
              return session;
            },
      
            async jwt ({token}) { //set the token
              //console.log({token});
              //await dbConnect();
              //const dbUser = await User.findOne({ email: token.email }).select("-password").lean();
              //get user by email??
              //token.sub = dbUser._id.toString();
              //token.customField = "test";
              return token;
            } 
          }
    }
})