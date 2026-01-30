import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getUserStats, db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
    const userId = params.id;

    // Fetch user basic info using the centralized db instance
    const user = db
        .prepare('SELECT id, name, email, image, role, created_at FROM users WHERE id = ?')
        .get(userId) as any;

    if (!user) {
        throw error(404, 'Utilisateur non trouvé');
    }

    // Fetch stats
    const stats = getUserStats(userId);

    return {
        viewedUser: user,
        stats
    };
};
