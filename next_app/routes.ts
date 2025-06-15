
// array of routes taht are accessible to the public
// these routes do not require authentication
// @type {string[]}
export const publicRoutes = [
    "/",
    "/auth/new-verification",
];


// array of routes taht are used for authentication
// these routes redirect logged in users to /dashboard
// @type {string[]}
// only for log out user
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/reset",
    "/auth/new-password"
];

// the prefix for api authehtication routes
// routes that astart with this prefix are used for API authentication process
// @type {string}
export const apiAuthPrefix = "/api/auth";   // must be access for all router

// the default redirect path after login
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";