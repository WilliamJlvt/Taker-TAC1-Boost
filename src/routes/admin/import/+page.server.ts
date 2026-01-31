import { fail, type Actions } from '@sveltejs/kit';
import { getCategories, importQuestionsFromJSON } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		categories: getCategories()
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const categoryId = Number(data.get('category'));
		const file = data.get('file') as File;

		if (!categoryId || !file) {
			return fail(400, { missing: true });
		}

		try {
			const content = await file.text();
			const json = JSON.parse(content);
			const result = importQuestionsFromJSON(json, categoryId);

			return { success: true, ...result };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			return fail(500, { error: 'Failed to process file: ' + message });
		}
	}
};
