import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User"; // Ensure your User model is imported

// 1. GET ALL USERS
export async function GET() {
  try {
    await connectToDB();
    
    // Sare users lao, naye wale sabse upar
    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

// 2. BLOCK / UNBLOCK USER
export async function PUT(req: Request) {
  try {
    await connectToDB();
    const { userId, isActive } = await req.json();

    await User.findByIdAndUpdate(userId, { isActive: isActive });

    return NextResponse.json({ success: true, message: "User status updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}