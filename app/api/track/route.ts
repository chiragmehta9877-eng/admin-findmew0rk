import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    // 1. Connect DB
    await connectToDB();

    // 2. Parse Body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const { jobId, type } = body;

    console.log(`🔍 Tracking Request -> Type: ${type}, ID: ${jobId}`);

    if (!jobId || !type) {
      return NextResponse.json({ success: false, error: "Missing Data" }, { status: 400 });
    }

    // 3. Normalize Type & Determine Field
    const interactionType = type.toLowerCase(); 
    const updateField = interactionType === 'click' ? { clicks: 1 } : { views: 1 };

    // 4. 🔥 SMART LOOKUP: Check 'job_id' (Twitter String ID) first
    let updatedJob = await Job.findOneAndUpdate(
      { job_id: jobId }, 
      { $inc: updateField },
      { new: true }
    );

    // 5. Fallback: Check '_id' (Mongo ObjectId) if not found above
    if (!updatedJob && mongoose.isValidObjectId(jobId)) {
       updatedJob = await Job.findByIdAndUpdate(
         jobId,
         { $inc: updateField },
         { new: true }
       );
    }

    if (!updatedJob) {
      console.log("❌ Job Not Found in DB");
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    console.log(`✅ Success! [${updatedJob.job_title.substring(0, 15)}...] -> Views: ${updatedJob.views}, Clicks: ${updatedJob.clicks}`);
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🔥 Tracking API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}