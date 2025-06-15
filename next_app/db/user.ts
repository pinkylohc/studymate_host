'use server'

import { Pool } from "@neondatabase/serverless"
import bcrypt from "bcryptjs";


export async function getUserByEmail(email: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; // return the first user that matches the email
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getUserById(id: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM users WHERE id = $1',
        values: [id],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; // return the user that matches the id
    } catch (err) {
        console.error(err);
        return null;
    }
}

// check if the current user is linked to a google or github account
export async function checkUserLink(id: string) {   
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT provider FROM accounts WHERE "userId" = $1',
        values: [id],
    };

    try {
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            return result.rows.map(row => row.provider); // return the providers that match the user_id
        } else {
            return null; // no linked accounts found
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}

// delete account
export async function deleteAccount(id: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'DELETE FROM users WHERE id = $1',
        values: [id],
    };
    const query2 = {
        text: 'DELETE FROM accounts WHERE "userId" = $1',
        values: [id],
    };

    try {
        await pool.query('BEGIN'); // Start transaction
        await pool.query(query);
        await pool.query(query2);
        await pool.query('COMMIT'); // Commit transaction
    } catch (err) {
        await pool.query('ROLLBACK'); // Rollback transaction in case of error
        console.error(err);
    } finally {
        pool.end(); // Close the pool
    }
}

// update account - user name
export async function updateUserName(id: string, name: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'UPDATE users SET name = $1 WHERE id = $2',
        values: [name, id],
    };

    try {
        await pool.query(query);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end(); // Close the pool
    }
}

// update password
export async function updatePassword(id: string, password: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const hashedPassword = await bcrypt.hash(password, 10);


    const query = {
        text: 'UPDATE users SET password = $1 WHERE id = $2',
        values: [hashedPassword, id],
    };

    try {
        await pool.query(query);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end(); // Close the pool
    }
}