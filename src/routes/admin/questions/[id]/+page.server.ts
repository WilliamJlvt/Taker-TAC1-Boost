import { fail, redirect, type Actions } from '@sveltejs/kit';
import { getCategories, getQuestion, updateQuestion } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const question = getQuestion(id);
	const categories = getCategories();

	if (!question) {
		throw redirect(303, '/admin/questions');
	}

	return {
		question,
		categories
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();
		const categoryId = Number(data.get('category'));
		const questionText = data.get('question') as string;

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
			return fail(400, {
				missing: true,
				error: 'Question requires category, text and at least 2 answers'
			});
		}

		if (!answers.some((a) => a.isCorrect)) {
			return fail(400, { error: 'At least one answer must be correct' });
		}

		try {
			updateQuestion(id, {
				categoryId,
				questionText,
				answers
			});
		} catch (error) {
			return fail(500, { error: 'Failed to update question' });
		}

		throw redirect(303, '/admin/questions');
	}
};
