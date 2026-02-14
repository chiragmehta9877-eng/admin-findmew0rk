import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(req: Request) {
  try {
    await connectToDB();

    // 🔥 DELETE COMMAND
    // Sirf 'X Hiring Bot' wali jobs delete karega
    const result = await Job.deleteMany({
      employer_name: "X Hiring Bot" 
    });

    return NextResponse.json({ 
      success: true, 
      message: `✅ Cleanup Done! Deleted ${result.deletedCount} jobs from 'X Hiring Bot'.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}