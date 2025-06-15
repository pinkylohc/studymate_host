import { Pool } from "@neondatabase/serverless"


export const getVerificationTokenByEmail = async (
    email: string
) => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try{
        const query = 'SELECT * FROM verificationtoken WHERE email = $1 LIMIT 1';
        const values = [email];
        const result = await pool.query(query, values);

        return result.rows[0];

    } catch {
        return null;
    }
}

export const getVerificationTokenByToken = async (
    token: string
) => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try{
        const query = 'SELECT * FROM verificationtoken WHERE token = $1 LIMIT 1';
        const values = [token];
        const result = await pool.query(query, values);

        return result.rows[0];

    } catch {
        return null;
    }
}