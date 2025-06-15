"use server"

import { Pool } from "@neondatabase/serverless"


export const getPasswordResetTokenByEmail = async (
    email: string
) => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try{
        const query = 'SELECT * FROM passwordresettoken WHERE email = $1 LIMIT 1';
        const values = [email];
        const result = await pool.query(query, values);

        return result.rows[0];

    } catch {
        return null;
    }
}

export const getPasswordResetTokenByToken = async (
    token: string
) => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try{
        const query = 'SELECT * FROM passwordresettoken WHERE token = $1 LIMIT 1';
        const values = [token];
        const result = await pool.query(query, values);

        return result.rows[0];

    } catch {
        return null;
    }
}