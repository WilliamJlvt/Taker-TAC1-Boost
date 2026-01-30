import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { saveScore, getLeaderboard, updateQuestionStats, getOrCreateUser } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const mode = url.searchParams.get('mode');

	if (!mode || (mode !== 'organisationnelle' && mode !== 'tresorerie')) {
		return json({ error: 'Invalid mode. Must be "organisationnelle" or "tresorerie"' }, { status: 400 });
	}

	const leaderboard = getLeaderboard(mode);
	return json({ leaderboard });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();

	if (!session?.user?.id || !session.user.email) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const body = await request.json();
	const { examMode, score, totalQuestions, correctAnswers, timeSpent, categoryScores } = body;

	// Validate exam mode
	if (!examMode || (examMode !== 'organisationnelle' && examMode !== 'tresorerie')) {
		return json({ error: 'Invalid exam mode' }, { status: 400 });
	}

	// Validate score data
	if (typeof score !== 'number' || score < 0 || score > 100) {
		return json({ error: 'Invalid score' }, { status: 400 });
	}

	try {
		// Ensure user exists in DB to prevent foreign key errors (in case of DB reset with active session)
		getOrCreateUser({
			id: session.user.id,
			email: session.user.email,
			name: session.user.name || 'Unknown',
			image: session.user.image || null
		});

		const savedScore = saveScore({
			user_id: session.user.id,
			exam_mode: examMode,
			score,
			total_questions: totalQuestions,
			correct_answers: correctAnswers,
			time_spent: timeSpent,
			category_scores: JSON.stringify(categoryScores)
		});

		// Update question statistics if provided
		const { questionResults } = body;
		if (Array.isArray(questionResults) && questionResults.length > 0) {
			try {
				updateQuestionStats(questionResults);
			} catch (statsError) {
				console.error('Failed to update question stats:', statsError);
				// Don't fail the whole request just because stats failed
			}
		}

		return json({ success: true, score: savedScore });
	} catch (error) {
		console.error('Error saving score:', error);
		return json({ error: 'Failed to save score' }, { status: 500 });
	}
};
