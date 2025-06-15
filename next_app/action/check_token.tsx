"use server"

import { Pool } from "@neondatabase/serverless"
import { getUserByEmail } from "@/db/user"
import { getVerificationTokenByToken } from "@/db/verification_token"

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);

    const hasExpired = new Date(existingToken.expires) < new Date();

    if(hasExpired) {
        return { error: "Token has expired" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if(!existingUser) {
        return { error: "Email does not exist" };
    }

    if(!existingToken) {
        return { error: "Token does not exist" };
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const query = 'UPDATE users SET "emailVerified" = $1, email = $2 WHERE id = $3';
    const values = [new Date(), existingToken.email, existingUser.id];
    await pool.query(query, values);

    const deleteQuery = 'DELETE FROM verificationtoken WHERE id = $1';
    const deleteValues = [existingToken.id];
    await pool.query(deleteQuery, deleteValues);

    return { success: "Email verified" };

}