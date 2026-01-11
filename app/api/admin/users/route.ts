import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

// 1. GET ALL USERS
export async function GET() {
  try {
    await connectToDB();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Fetch Failed" }, { status: 500 });
  }
}

// 2. BLOCK / UNBLOCK USER
export async function PUT(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    console.log("🔥 Block Request Body:", body); // Console check karo

    const { userId, isActive } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID Missing" }, { status: 400 });
    }

    // Status Update
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { isActive: isActive }, 
      { new: true }
    );

    if (!updatedUser) {
        return NextResponse.json({ success: false, message: "User ID not found in DB" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Status Updated", data: updatedUser });

  } catch (error) {
    console.error("Block Error:", error);
    return NextResponse.json({ success: false, error: "Update Failed" }, { status: 500 });
  }
}