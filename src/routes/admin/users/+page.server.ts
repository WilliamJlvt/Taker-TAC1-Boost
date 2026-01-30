import type { Actions, PageServerLoad } from './$types';
import { deleteUser, getAllUsers, isAdmin } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session?.user?.id || !isAdmin(session.user.email)) {
		throw redirect(303, '/');
	}

	const users = getAllUsers();

	return {
		users
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const session = await locals.auth();

		if (!session?.user?.id || !isAdmin(session.user.email)) {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const userId = data.get('id') as string;

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		// Prevent deleting yourself
		if (userId === session.user.id) {
			return fail(400, { error: 'Cannot delete your own account' });
		}

		try {
			const success = deleteUser(userId);
			if (!success) {
				return fail(404, { error: 'User not found' });
			}
			return { success: true };
		} catch (error) {
			console.error('Failed to delete user:', error);
			return fail(500, { error: 'Failed to delete user' });
		}
	},
	updateRole: async ({ request, locals }) => {
		const session = await locals.auth();

		if (!session?.user?.id || !isAdmin(session.user.email)) {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const userId = data.get('id') as string;
		const role = data.get('role') as string;

		if (!userId || !role) {
			return fail(400, { error: 'Missing user ID or role' });
		}

		if (role !== 'admin' && role !== 'user') {
			return fail(400, { error: 'Invalid role' });
		}

		// Prevent demoting yourself
		if (userId === session.user.id && role !== 'admin') {
			return fail(400, { error: 'Cannot demote yourself' });
		}

		try {
			const { updateUserRole } = await import('$lib/server/db');
			const success = updateUserRole(userId, role);
			if (!success) {
				return fail(404, { error: 'User not found' });
			}
			return { success: true };
		} catch (error) {
			console.error('Failed to update role:', error);
			return fail(500, { error: 'Failed to update role' });
		}
	}
};
