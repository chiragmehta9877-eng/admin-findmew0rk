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
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

// 2. CREATE USER (POST)
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    
    // Check if email already exists
    const exists = await User.findOne({ email: body.email });
    if (exists) {
        return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
    }

    const newUser = await User.create(body);
    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}

// 3. UPDATE USER ROLE OR STATUS (PATCH)
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const { id, role, isActive } = await req.json();

    const updateData: any = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await User.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

// 4. DELETE USER (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}