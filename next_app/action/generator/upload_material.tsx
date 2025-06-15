"use server"

import { auth} from "@/auth";
import { CreateQuizCount, CreateSummaryCount } from "@/db/gamification_record";
import { Pool } from "@neondatabase/serverless"


/**
 * 
 * upload material to database
 * @param content : json return
 * @param type : type of material (quiz / summary / tutorial)
 * @param inputfile : list of input file name
 */
export async function uploadMaterial(content: any, type: string, inputfile:any){
    const session = await auth();
    
    const userid = session?.user?.id;

    const time = new Date();

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })

    const result = await pool.query(
        `INSERT INTO studymaterial ("userId", materialtype, input, content, "createTime", title) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`, // Get the ID of the inserted row
        [userid, type, inputfile, content, time, 'Material Title from db']
    );

    if(type === 'summary'){
        console.log('create summary');
        await CreateSummaryCount(Number(userid));
    }
    if(type === 'quiz'){
        console.log('create quiz');
        await CreateQuizCount(Number(userid));
    }


    const insertedId = result.rows[0].id; // Access the ID from the result
    return insertedId as number; // Return the ID


};