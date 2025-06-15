"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { Pool } from "@neondatabase/serverless"

import { RegisterSchema } from "@/schemas";

import { getUserByEmail } from "@/db/user";
import { generateVerificationToken } from "@/lib/generate_token";
import  { sendVerificationEmail } from "@/lib/verify_mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    console.log("finish email")
    const validatedFields = RegisterSchema.safeParse(values);

    if(!validatedFields.success){
        return {error: "Invalid fields!"};
    }

    const {name, email, password} = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if(existingUser){
        return {error: "Email already in use!"};
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    await pool.query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
        [name, email, hashedPassword]
    );
    
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return {success: "Verification email sent!"};
}