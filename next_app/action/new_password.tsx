"use server"

import * as z from "zod";
import bcrypt from "bcryptjs";

import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/db/reset_token";
import { getUserByEmail } from "@/db/user";
import { Pool } from "@neondatabase/serverless"

export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token?: string | null,
) => {
    if(!token){
        return { error: "Missing Token"}
    }

    const validatedField = NewPasswordSchema.safeParse(values);

    if(!validatedField.success) return { error: "Invalid Field!"}

    const { password } = validatedField.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if(!existingToken) return { error: "Invalid Token!"}

    const hasExpired = new Date(existingToken.expires) < new Date();

    if(hasExpired) return { error: "Token has expired!"}

    const existingUser = await getUserByEmail(existingToken.email);

    if(!existingUser){ return { error: "Email does not exist!"} }

    const hashedpassword = await bcrypt.hash(password, 10);

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    const resetvalue = [hashedpassword, existingUser.id];
    await pool.query(query, resetvalue);

    const deleteQuery = 'DELETE FROM passwordresettoken WHERE id = $1';
    const deleteValues = [existingToken.id];
    await pool.query(deleteQuery, deleteValues);

    return { success: "Password updated!" };
} 