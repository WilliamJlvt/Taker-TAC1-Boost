import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getUserStats } from '$lib/server/db';

export const GET: RequestHandler = async ({ locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    const stats = getUserStats(session.user.id);
    return json({ stats });
};
