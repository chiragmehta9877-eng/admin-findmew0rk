import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";

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

// 🔥 FIX: Update karte waqt bhi saare link update honge
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB();
    const { id } = await params; 
    const body = await req.json();

    // Agar user ne link change kiya hai, toh sab jagah sync krdo
    const updateData = {
      ...body,
    };

    if (body.apply_link) {
      updateData.job_url = body.apply_link;
      updateData.url = body.apply_link;
      updateData.link = body.apply_link;
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job Updated!", data: updatedJob });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}