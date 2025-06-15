"use server"

import { Pool } from "@neondatabase/serverless"

// check in dashboard page to see if the user has a gamification record
export async function checkGamificationRecord(userId: number) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
      text: 'SELECT * FROM gamification WHERE user_id = $1',
      values: [userId],
    };
  
    try {
      const result = await pool.query(query);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

export async function createGamificationRecord(userId: number) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = {
        text: 'INSERT INTO gamification (user_id) VALUES ($1) RETURNING *',
        values: [userId],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0]; 
    } catch (err) {
        console.error(err);
        return null;
    }
}

// add number of createdSummary
// add points
export async function CreateSummaryCount(userId: number) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const query = {
    text: 'UPDATE gamification SET "createdSummary" = "createdSummary" + 1, points = points + 20 WHERE user_id = $1',
    values: [userId],
  };

  try {
    await pool.query(query);
  } catch (err) {
    console.error(err);
  }
}

// add number of createdQuiz
// add points
export async function CreateQuizCount(userId: number) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const query = {
    text: 'UPDATE gamification SET "createdQuiz" = "createdQuiz" + 1, points = points + 20 WHERE user_id = $1',
    values: [userId],
  };

  try {
    await pool.query(query);
  } catch (err) {
    console.error(err);
  }
}


// add number of completedQuiz
// add points
export async function CompleteQuizCount(quizId: number) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const userQuery = {
    text: 'SELECT "userId" FROM studymaterial WHERE id = $1',
    values: [quizId],
  };


  try {
    const userResult = await pool.query(userQuery);
    const userId = userResult.rows[0]?.userId as number;
    console.log('id: ', userId);

    const query = {
      text: 'UPDATE gamification SET "completedQuiz" = "completedQuiz" + 1, points = points + 10 WHERE user_id = $1',
      values: [userId],
    };
    await pool.query(query);

  } catch (err) {
    console.error(err);
  }
}



const badgeCriteria = {
  quiz: [
    { count: 1, badge: 'Quiz Creator', explanation: 'This badge is awarded for creating your first quiz.' },
    { count: 10, badge: 'Quiz Enthusiast', explanation: 'This badge is awarded for creating 10 quizzes.' },
    { count: 50, badge: 'Quiz Master', explanation: 'This badge is awarded for creating 50 quizzes.' },
  ],
  summary: [
    { count: 1, badge: 'Summary Creator', explanation: 'This badge is awarded for creating your first summary.' },
    { count: 10, badge: 'Summary Enthusiast', explanation: 'This badge is awarded for creating 10 summaries.' },
    { count: 50, badge: 'Summary Master', explanation: 'This badge is awarded for creating 50 summaries.' },
  ],
  completeQuiz: [
    { count: 5, badge: 'Quiz Champion', explanation: 'This badge is awarded for completing 5 quizzes.' },
  ],
};

// award badges based on the criteria
export async function awardBadges(userId: number) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const query = {
    text: 'SELECT "createdSummary", "createdQuiz", "completedQuiz" FROM gamification WHERE user_id = $1',
    values: [userId],
  };

  try {
    const result = await pool.query(query);
    console.log('result: ', result.rows[0]);
    const { createdSummary, createdQuiz, completedQuiz } = result.rows[0];

    const badges = [];

    // Check quiz badges
    for (const criteria of badgeCriteria.quiz) {
      if (createdQuiz >= criteria.count) {
        badges.push({ badge: criteria.badge, explanation: criteria.explanation });
      }
    }

    // Check summary badges
    for (const criteria of badgeCriteria.summary) {
      if (createdSummary >= criteria.count) {
        badges.push({ badge: criteria.badge, explanation: criteria.explanation });
      }
    }

    // Check complete quiz badges
    for (const criteria of badgeCriteria.completeQuiz) {
      if (completedQuiz >= criteria.count) {
        badges.push({ badge: criteria.badge, explanation: criteria.explanation });
      }
    }
    console.log('return badges: ', badges);
    return badges;
  } catch (err) {
    console.error(err);
    return [];
  }
}