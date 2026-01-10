import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectToDB();
    
    // 🔥 YAHAN APNA ASLI EMAIL LIKHO JISSE TUM LOGIN KARTE HO
    const myEmail = "tumhara_email@gmail.com"; 

    // Find and Update
    const user = await User.findOneAndUpdate(
      { email: myEmail },
      { role: "super_admin", isActive: true }, // Role upgrade kar diya
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found! Pehle ek baar login attempt karo taaki user DB me save ho jaye." });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${user.email} is now SUPER ADMIN! 👑`, 
      user 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Error updating role" });
  }
}