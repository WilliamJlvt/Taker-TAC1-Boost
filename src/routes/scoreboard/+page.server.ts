import type { PageServerLoad } from './$types';
import { isAdmin } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.auth();
    const isUserAdmin = isAdmin(session?.user?.email);
    return { session, isUserAdmin };
};
