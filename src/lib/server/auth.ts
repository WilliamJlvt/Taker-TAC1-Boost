import type { Handle } from '@sveltejs/kit';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { getOrCreateUser } from '$lib/server/db';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';

const { handle: authHandle } = SvelteKitAuth({
    secret: AUTH_SECRET,
    providers: [
        Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google' && profile?.email) {
                getOrCreateUser({
                    id: user.id!,
                    email: profile.email,
                    name: profile.name || 'Unknown',
                    image: profile.picture || null
                });
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    trustHost: true
});

export const handle: Handle = authHandle;
