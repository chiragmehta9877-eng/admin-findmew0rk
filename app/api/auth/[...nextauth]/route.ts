import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
        
        // 🔥 FIX 1: 'user: any' lagaya hai taaki TypeScript password error na de
        const user: any = await User.findOne({ email: credentials.email }).select("+password");
        
        if (!user) throw new Error("User not found!");
        
        // Check if password exists (Google login users won't have it)
        if (!user.password) throw new Error("Please login with Google.");
        
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Wrong Password!");

        return user;
      }
    })
  ],
  callbacks: {
    // 🔥 2. JWT Callback
    async jwt({ token, user }) {
      if (user) {
        // User login hote hi role token me daal do
        token.role = (user as any).role;
        token.id = (user as any)._id;
      }
      
      // Google Login walo ke liye DB check
      if (!token.role && token.email) {
          await connectToDB();
          const dbUser: any = await User.findOne({ email: token.email });
          if (dbUser) {
              token.role = dbUser.role;
              token.id = dbUser._id;
          }
      }
      return token;
    },

    // 🔥 3. Session Callback
    async session({ session, token }) {
      if (session?.user) {
        // Token se session me data copy karo
        // @ts-ignore
        session.user.role = token.role; 
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },

    // 🔥 4. SignIn Check (Admin Protection)
    async signIn({ user, account }) {
      await connectToDB();
      
      if (account?.provider === "credentials") return true;
      
      if (account?.provider === "google") {
        const dbUser: any = await User.findOne({ email: user.email });
        
        if (!dbUser) return false; // Account nahi hai to login fail
        if (dbUser.isActive === false) return false; // Blocked user
        
        // 🔥 SIRF Admin allow karein
        if (dbUser.role !== 'admin' && dbUser.role !== 'super_admin') return false;
        
        return true;
      }
      return true;
    }
  },
  pages: {
    signIn: '/login', 
    error: '/login', 
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };