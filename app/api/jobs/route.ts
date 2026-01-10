import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";

// GET
export async function GET() {
  try {
    await connectToDB();
    const jobs = await Job.find().sort({ posted_at: -1 }).limit(500);
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// 🔥 POST (CREATE JOB)
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    if (!body.job_title || !body.employer_name || !body.apply_link) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 🕵️‍♂️ FORCE NAME LOGIC
    // Agar frontend se naam aaya to wo, nahi to 'Admin' (Hardcoded)
    let adminName = 'Admin';
    if (body.updated_by && body.updated_by !== 'System') {
        adminName = body.updated_by;
    }

    const newJob = await Job.create({
      job_id: `manual-${Date.now()}`,
      job_title: body.job_title,
      employer_name: body.employer_name,
      category: body.category || 'General',
      source: body.source || 'manual',
      
      // 🔥 Yahan hum zabardasti 'Admin' daal rahe hain
      updated_by: adminName, 

      apply_link: body.apply_link, 
      job_url: body.apply_link,
      url: body.apply_link,
      link: body.apply_link,

      text: body.text || '',
      posted_at: new Date(),
    });

    return NextResponse.json({ success: true, message: "Job Created!", data: newJob });

  } catch (error: any) {
    // DUPLICATE KEY ERROR HANDLING
    if (error.code === 11000) {
        return NextResponse.json({ success: false, error: "Duplicate Job Error! Try changing the link or title." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { id } = await req.json();
    await Job.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

// PATCH (Fix Links & Indexes)
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    try { await Job.collection.dropIndexes(); } catch(e) {} // Drop old indexes
    
    await Job.collection.updateMany(
      { apply_link: { $exists: true } }, 
      [{ $set: { job_url: "$apply_link", url: "$apply_link", link: "$apply_link" } }]
    );
    return NextResponse.json({ success: true, message: "DB Fixed & Indexes Reset!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}