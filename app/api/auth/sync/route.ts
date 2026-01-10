import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, email, image } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "No email provided" }, { status: 400 });
    }

    // 🔥 UPSERT LOGIC (Update if exists, Insert if new)
    // Hum role update nahi kar rahe taaki Admin ka role galti se User na ban jaye
    const user = await User.findOneAndUpdate(
      { email },
      { 
        $set: { name, email, image }, // Update Name/Image
        $setOnInsert: { role: 'user', isActive: true } // Set default role only if creating new
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}