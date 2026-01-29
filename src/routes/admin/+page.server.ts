import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Get stats using raw SQL for efficiency
    const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

    return {
        stats: {
            questions: questionCount.count,
            categories: categoryCount.count,
            users: userCount.count
        }
    };
};
