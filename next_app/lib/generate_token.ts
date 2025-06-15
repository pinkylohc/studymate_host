//npm i uuid
//npm i --save-dev @types/uuid

import { v4 as uuidv4 } from 'uuid';

import { Pool } from "@neondatabase/serverless"
import { getVerificationTokenByEmail } from '@/db/verification_token';
import { getPasswordResetTokenByEmail } from '@/db/reset_token';

export const generatePasswordResetToken = async(email:string) =>{
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const token = uuidv4();

    //expire in 1hr
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    //check if token already exists
    const existingToken = await getPasswordResetTokenByEmail(email);

    if(existingToken){
        await pool.query('DELETE FROM passwordresettoken WHERE id = $1', [existingToken.id]);
    };

    const query = 'INSERT INTO passwordresettoken(email, token, expires) VALUES($1, $2, $3) RETURNING *';
    const values = [email, token, expires];
    const result = await pool.query(query, values);

    const resetToken = result.rows[0];

    return resetToken;
}


export const generateVerificationToken = async(email:string) => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const token = uuidv4();

    //expire in 1hr
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    //check if token already exists
    const existingToken = await getVerificationTokenByEmail(email);

    if(existingToken){
        await pool.query('DELETE FROM verificationtoken WHERE id = $1', [existingToken.id]);
    };

    const query = 'INSERT INTO verificationtoken(email, token, expires) VALUES($1, $2, $3) RETURNING *';
    const values = [email, token, expires];
    const result = await pool.query(query, values);

    const verificationToken = result.rows[0];

    return verificationToken;
}