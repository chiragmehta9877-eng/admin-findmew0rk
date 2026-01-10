import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs"; // 🔥 Import bcrypt

// 1. GET ALL USERS (Same as before)
export async function GET() {
  try {
    await connectToDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

// 2. CREATE NEW USER (🔥 Updated for Email/Pass)
export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, email, password, role } = await req.json();

    // Validations
    if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return NextResponse.json({ success: false, error: "User already exists!" }, { status: 400 });
    }

    // 🔥 Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword, // Hashed password save karo
        role: role || 'user',
        isActive: true,
        image: "" // Default empty image
    });

    return NextResponse.json({ success: true, message: "User Created!", data: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Creation failed" }, { status: 500 });
  }
}

// 3. UPDATE USER (Same as before)
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const { id, role, isActive } = await req.json();
    const updatedUser = await User.findByIdAndUpdate(id, { role, isActive }, { new: true });
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE USER (Same as before)
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { id } = await req.json();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}