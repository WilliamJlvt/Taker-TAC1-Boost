import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const session = await locals.auth();

    if (!session?.user?.email || !isAdmin(session.user.email)) {
        throw redirect(303, '/');
    }

    return {
        user: session.user
    };
};
