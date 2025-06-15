"use server"

import { Pool } from "@neondatabase/serverless"
import { CompleteQuizCount } from "./gamification_record";

export async function uploadQuizResult(quizid: number, result: any) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'INSERT INTO quizresult (quizid, result, "createTime") VALUES ($1, $2, NOW()) RETURNING *',
        values: [quizid, result],
    };

    try {
        const result = await pool.query(query);
        await CompleteQuizCount(quizid);
        return result.rows[0].id; // return the first user that matches the email
    } catch (err) {
        console.error(err);
        return null;
    }
}


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

export async function getAllResultbyId(id: number) {    // get quiz result base on quiz id (may be more than 1)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM quizresult WHERE quizid = $1',
        values: [id],
    };

    try {
        const result = await pool.query(query);
        return result.rows; // return the all match
    } catch (err) {
        console.error(err);
        return null;
    }
}



export async function getLatestQuizAttemptByQuizId(id: number) {    // get quiz result base on quiz id (may be more than 1)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM quizresult WHERE quizid = $1 ORDER BY "createTime" DESC LIMIT 1',
        values: [id],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; // return the all match
    } catch (err) {
        console.error(err);
        return null;
    }
}
