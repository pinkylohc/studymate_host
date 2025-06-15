import { Pool } from "@neondatabase/serverless"


/**
 * user for user record page
 * @param userid 
 * @returns all record of the user
 */
export async function getAllRecordbyUserid(userid: number) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM studymaterial WHERE "userId" = $1 ORDER BY "createTime" DESC',
        values: [userid],
    };

    try {
        const result = await pool.query(query);
        return result.rows; // return all material data
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * user for user dashboard page
 * @param userid 
 * @returns recent three quiz of the user
 */
export async function getRecentThreeQuiz(userid: number) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM studymaterial WHERE "userId" = $1 AND "materialtype" = $2 ORDER BY "createTime" DESC LIMIT 3',
        values: [userid, 'quiz'],
    };

    try {
        const result = await pool.query(query);
        return result.rows; // return all material data
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * user for user dashboard page
 * @param userid 
 * @returns recent three summary of the user
 */
export async function getRecentThreeSummary(userid: number) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'SELECT * FROM studymaterial WHERE "userId" = $1 AND "materialtype" = $2 ORDER BY "createTime" DESC LIMIT 3',
        values: [userid, 'summary'],
    };

    try {
        const result = await pool.query(query);
        return result.rows; // return all material data
    } catch (err) {
        console.error(err);
        return null;
    }
}
