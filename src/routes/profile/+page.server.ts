import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserStats } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session?.user) {
		throw redirect(302, '/');
	}

	const stats = getUserStats(session.user.id!);

	return {
		session,
		stats
	};
};
