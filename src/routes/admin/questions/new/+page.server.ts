import { fail, redirect, type Actions } from '@sveltejs/kit';
import { getCategories, createQuestion } from '$lib/server/db';
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
		const questionText = data.get('question') as string;

		// Parse answers from form data
		// Format: answers[0][text], answers[0][correct], answers[0][rationale]
		const answers = [];
		let i = 0;
		while (data.has(`answers[${i}][text]`)) {
			const text = data.get(`answers[${i}][text]`) as string;
			const isCorrect = data.get(`answers[${i}][correct]`) === 'on';
			const rationale = data.get(`answers[${i}][rationale]`) as string;

			if (text) {
				answers.push({ text, isCorrect, rationale });
			}
			i++;
		}

		if (!categoryId || !questionText || answers.length < 2) {
			// Require at least 2 answers
			return fail(400, {
				missing: true,
				error: 'Question requires category, text and at least 2 answers'
			});
		}

		// Ensure at least one correct answer
		if (!answers.some((a) => a.isCorrect)) {
			return fail(400, { error: 'At least one answer must be correct' });
		}

		try {
			createQuestion({
				categoryId,
				questionText,
				answers
			});
		} catch {
			return fail(500, { error: 'Failed to create question' });
		}

		throw redirect(303, '/admin/questions');
	}
};
