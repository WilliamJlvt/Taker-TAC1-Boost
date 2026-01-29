import { fail, type Actions } from '@sveltejs/kit';
import { getCategories, createCategory } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const categories = getCategories();
    return { categories };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const slug = data.get('slug') as string;
        const description = data.get('description') as string;

        if (!name || !slug) {
            return fail(400, { missing: true });
        }

        try {
            createCategory({ name, slug, description });
            return { success: true };
        } catch (error) {
            return fail(500, { error: 'Failed to create category' });
        }
    }
};
