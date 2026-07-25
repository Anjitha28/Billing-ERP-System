import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isLoginRoute = nextUrl.pathname === '/login';
      const isChangePasswordRoute = nextUrl.pathname === '/change-password';
      
      if (isAuthRoute) return true;

      if (!isLoggedIn) {
        if (isLoginRoute) return true;
        return false;
      }

      // User is logged in
      const user = auth?.user as any;
      const mustReset = user?.mustResetPassword;

      if (mustReset) {
        if (!isChangePasswordRoute) {
          return Response.redirect(new URL('/change-password', nextUrl));
        }
        return true;
      }

      // Logged in, no password reset needed
      if (isLoginRoute || isChangePasswordRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.mustResetPassword = (user as any).mustResetPassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role as string;
        session.user.id = token.id as string;
        (session.user as any).mustResetPassword = token.mustResetPassword as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  }
} satisfies NextAuthConfig;
