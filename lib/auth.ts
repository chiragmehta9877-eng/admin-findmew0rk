import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔥 Attempting Login for:", credentials?.email); // Debug Log 1

        await connectToDB();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          console.log("❌ User not found in DB"); // Debug Log 2
          throw new Error("User not found");
        }

        console.log("✅ User Found:", user.email); // Debug Log 3
        console.log("🔑 Has Password?", user.password ? "YES" : "NO"); // Debug Log 4

        if (!user.password) {
           throw new Error("Please login with Google (No Password set)");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        
        if (!isMatch) {
          console.log("❌ Password Mismatch"); // Debug Log 5
          throw new Error("Invalid password");
        }

        return user;
      }
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};