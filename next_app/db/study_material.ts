"use server"

import { Pool } from "@neondatabase/serverless"

export async function getMaterialById(id: number, type: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM studymaterial WHERE id = $1 AND materialtype = $2',
        values: [id, type],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; // return the first user that matches the email
    } catch (err) {
        console.error(err);
        return null;
    }
}