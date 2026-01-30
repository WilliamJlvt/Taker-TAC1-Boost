import { fail, type Actions } from '@sveltejs/kit';
import { getQuestions, deleteQuestion, getCategories } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 20;
	const offset = (page - 1) * limit;
	const categoryId = Number(url.searchParams.get('category')) || undefined;
	const search = url.searchParams.get('search') || undefined;

	const questions = getQuestions({ categoryId, search, limit, offset });
	const categories = getCategories();

	return {
		questions,
		categories,
		filters: { categoryId, search, page }
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { missing: true });

		try {
			deleteQuestion(id);
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete question' });
		}
	}
};
