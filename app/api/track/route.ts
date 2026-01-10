import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { jobId, type } = await req.json();

    console.log(`🔍 Tracking Request: ${type} for ID: ${jobId}`);

    if (!jobId || !type) {
      return NextResponse.json({ success: false, error: "Missing Data" }, { status: 400 });
    }

    const updateField = type === 'click' ? { clicks: 1 } : { views: 1 };

    // 🔥 SMART LOOKUP: Pehle 'job_id' se dhoondo, agar na mile to '_id' se
    let updatedJob = await Job.findOneAndUpdate(
      { job_id: jobId }, 
      { $inc: updateField },
      { new: true }
    );

    // Agar job_id se nahi mila, aur wo valid Mongo ID hai, to _id se try karo
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

    console.log(`✅ Success! Views: ${updatedJob.views}, Clicks: ${updatedJob.clicks}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🔥 Tracking Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}