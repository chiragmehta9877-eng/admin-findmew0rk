import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // 🔥 Middleware ke liye JWT strategy zaruri hai
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        await connectToDB();
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("User not found!");
        if (!user.password) throw new Error("Please login with Google.");
        
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Wrong Password!");

        return user;
      }
    })
  ],
  callbacks: {
    // 🔥 1. JWT Callback (Ye naya hai - Middleware isi ko padhta hai)
    async jwt({ token, user }) {
      // Jab user pehli baar login karega
      if (user) {
        token.role = user.role; // Credentials login se role mil jayega
        token.id = user._id;
      }
      
      // Google Login walo ke liye DB se role confirm karo
      if (!token.role && token.email) {
          await connectToDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
              token.role = dbUser.role;
              token.id = dbUser._id;
          }
      }
      return token;
    },

    // 🔥 2. Session Callback (Frontend isi ko padhta hai)
    async session({ session, token }) {
      if (session?.user) {
        // @ts-ignore
        session.user.role = token.role; // Token se role utha kar session me daalo
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },

    // 🔥 3. SignIn Check
    async signIn({ user, account }) {
      await connectToDB();
      if (account?.provider === "credentials") return true;
      if (account?.provider === "google") {
        const dbUser = await User.findOne({ email: user.email });
        if (!dbUser) return false;
        if (dbUser.isActive === false) return false;
        if (dbUser.role !== 'admin' && dbUser.role !== 'super_admin') return false;
        return true;
      }
      return true;
    }
  },
  pages: {
    signIn: '/login', 
    error: '/login', 
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };