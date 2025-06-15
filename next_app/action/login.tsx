"use server";

import { z } from "zod";
import { signIn } from "@/auth";
import {AuthError} from "next-auth";
import { generateVerificationToken } from "@/lib/generate_token";
import  { sendVerificationEmail } from "@/lib/verify_mail";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/db/user";

  
export async function login(values: z.infer<typeof LoginSchema>) {

    const validatedFields = LoginSchema.safeParse(values);

    if(!validatedFields.success){
        return {error: "Invalid fields!"};
    }


    if (validatedFields.success) {
        // save the data, send an email, etc. (TODO)
        const { email, password } = validatedFields.data;
        const existingUser = await getUserByEmail(validatedFields.data.email);

        if (!existingUser || !existingUser.email) {
            return {error: "Email does not exist!"};
        }
        if(!existingUser.password) return {error: "Email already in use with different provider!"}
        if (!existingUser.emailVerified) {
            const verificationToken = await generateVerificationToken(existingUser.email);
            //send email
            await sendVerificationEmail(verificationToken.email, verificationToken.token);
            return {success: "Confirmation email sent!"};
        } 

        try{
            await signIn("credentials", {
                email,
                password,
                redirectTo: "/dashboard",
            })
            return;
        } catch(error){
            if (error instanceof AuthError) {
                switch (error.type){
                    case "CredentialsSignin": return {error: "Invalid credentials"};
                    default: return {error: "Invalid credentials"};
                }
            }
            throw error; //****** */ not add -> will not redirect
        }

        
    } else {
        return { error: "Invalid credentials" };
    }
}