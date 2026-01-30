import { db, getDashboardStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get stats using helper which aggregates data
	const stats = getDashboardStats();

	// Also get raw counts for the summary cards
	const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as {
		count: number;
	};
	const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

	return {
		stats: {
			questions: questionCount.count,
			users: userCount.count,
			...stats
		}
	};
};
