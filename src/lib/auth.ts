import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// TODO: Integrate with backend API for authentication
// The backend will handle user validation, role management, and email allowlisting

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            // TODO: Call backend API to validate user email
            // For now, allowing all sign-ins (replace with backend validation)
            return true;
        },
        async jwt({ token, user, account }) {
            // Add user info to token on initial sign in
            if (user) {
                token.id = user.id;
                // TODO: Fetch user role from backend API
                token.role = "USER"; // Default role
            }
            return token;
        },
        async session({ session, token }) {
            // Add token data to session
            if (session.user) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
    },
});
