"use server"

import { Pool } from "@neondatabase/serverless"

export async function getQuizResultbyId(id: number) {   // get quiz result base on attempt id (only one)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM quizresult WHERE id = $1',
        values: [id],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; // return the first match
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getQuizbyId(id: number) {   // get quiz content
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM studymaterial WHERE id = $1',
        values: [id],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; // return the first match
    } catch (err) {
        console.error(err);
        return null;
    }
}