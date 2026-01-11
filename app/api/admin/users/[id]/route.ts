import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Job from "@/models/Job"; 

// 🔥 Next.js 15 Fix: params type is Promise now
export async function GET(
    req: Request, 
    { params }: { params: Promise<{ id: string }> } // Type change kiya
) {
  try {
    // 🔥 Await params here
    const { id } = await params;

    console.log("🔍 Fetching User ID:", id); 

    await connectToDB();

    // 1. ID Check
    if (!id || id.length !== 24) {
      return NextResponse.json({ success: false, message: `Invalid ID Received: ${id}` }, { status: 400 });
    }

    // 2. User Find
    let user = await User.findById(id).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 3. Populate
    try {
        const populatedUser = await User.findById(id).populate("bookmarks");
        if (populatedUser) {
            user = populatedUser;
        }
    } catch (popError) {
        console.warn("⚠️ Bookmarks load failed:", popError);
    }

    return NextResponse.json({ success: true, data: user });

  } catch (error: any) {
    console.error("🔥 API CRASH:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}