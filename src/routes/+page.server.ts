import { getAllQuestionsWithAnswers } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const questions = getAllQuestionsWithAnswers();
	return { session, questions };
};
