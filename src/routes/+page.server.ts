import { getAllQuestionsWithAnswers, isAdmin } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const questions = getAllQuestionsWithAnswers();
	const isUserAdmin = isAdmin(session?.user?.email);
	return { session, questions, isUserAdmin };
};
