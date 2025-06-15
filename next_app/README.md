# Laugage

TypeScript is used as the program laguage
Tailwind is used as the CSS style


# Navigation Overview

## starting page (/app/page.tsx)
router: / (public)
This page is the entry page of our web, giving instruction of our app

## login page (/app/auth/login/page.tsx)
router: /auth/login (auth)

## register page (/app/auth/register/page.tsx)
router: /auth/register (auth)

## verification page (app/auth/new_verification/page.tsx)
router: /auth/new-verification (public)

## dashboaard page (app/dashboard/page.tsx)
router: /dashboard (private)

## summary generator page
router: /summary-generator

## summary page
router: /materials/summary/[id]

## quiz generator page
router: /quiz-generator

## quiz page
router: /materials/quiz/[id]

## quiz result page
router: /materials/quiz/[id]/result?quizid=[quizid]&attempt=[attemptid]

# record page
router: /materials/my-record


# Need change in deployment

1. google oauth redirect link (https://console.cloud.google.com/) (two url && auth domain)

2. github oauth redirect link (https://github.com/settings/applications/ : Oauth app)

3. lib/verify_mail.ts -> change local host mail link (x2)