//import { auth } from "@/auth" 
import authConfig from "./auth.config";
import NextAuth from "next-auth";
 
const { auth } = NextAuth(authConfig);

import { publicRoutes, DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes } from "./routes";

export default auth((req) => {
  const {nextUrl} = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute){
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }
  
  if(!isLoggedIn && !isPublicRoute){
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return;
})
 
// Optionally, don't invoke Middleware on some paths
 // the path that the auth will run when get the path
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],     // mean involve in every single place, except....
}