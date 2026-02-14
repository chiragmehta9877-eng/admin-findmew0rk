import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";

// GET (Single Job Fetch)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB();
    const { id } = await params;
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

// 🔥 PUT (Update Job - Fixed Spotlight, Link & Handle Logic)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await req.json();

    console.log("🔄 Updating Job:", id);

    // 1. Email Extraction Logic
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const extractedEmail = (body.text || "").match(emailRegex)?.[0] || null;

    // 2. Handle/Username Sanitization (🔥 NEW FIX)
    // This ensures if you save "@HireEast", it is stored as "HireEast"
    let cleanHandle = body.handle || body.username || body.employer_handle;
    if (cleanHandle) {
        cleanHandle = cleanHandle.replace('@', '').replace(/\s+/g, '').trim();
    }

    // 3. Prepare Update Data
    const updateData: any = {
      ...body,
      // 🔥 Critical Fix: Explicitly set Spotlight
      isSpotlight: body.isSpotlight ?? false, 
      ...(extractedEmail && { contact_email: extractedEmail }),
      
      // 🔥 Save the cleaned handle explicitly so the Frontend X link works
      ...(cleanHandle && { handle: cleanHandle, username: cleanHandle }), 
    };

    // 4. Link Syncing Logic
    if (body.apply_link) {
      updateData.apply_link = body.apply_link;
      
      // Only overwrite generic url/link fields if it's a website link
      if (body.apply_link.startsWith("http")) {
         updateData.url = body.apply_link;
         updateData.link = body.apply_link;
         
         // ⚠️ IMPORTANT: Only overwrite 'job_url' (Original Link) if it wasn't explicitly provided
         if (!body.job_url) {
             updateData.job_url = body.apply_link;
         }
      }
    }

    // 🔥 Sync Original Post Link explicitly if provided
    if (body.job_url) {
        updateData.job_url = body.job_url;
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true, // Return updated document
      runValidators: true,
    });

    if (!updatedJob) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job Updated!", data: updatedJob });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}