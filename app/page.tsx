import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Path dhyan se check krna

export default async function Home() {
  // 1. Server side session check karo (Fast hota hai)
  const session = await getServerSession(authOptions);

  // 2. Agar user logged in hai -> Dashboard bhejo
  if (session) {
    redirect("/dashboard");
  }

  // 3. Agar logged in NAHI hai -> Login page bhejo
  redirect("/login");
}