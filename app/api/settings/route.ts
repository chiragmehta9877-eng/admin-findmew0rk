import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function GET() {
  await connectToDB();
  // Default setting dhundo, agar nahi hai to bana do
  let setting = await Setting.findOne({ name: "maintenance_mode" });
  if (!setting) {
    setting = await Setting.create({ name: "maintenance_mode", isEnabled: false });
  }
  return NextResponse.json({ success: true, isEnabled: setting.isEnabled });
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { isEnabled } = await req.json();
    
    // Status update karo
    const setting = await Setting.findOneAndUpdate(
      { name: "maintenance_mode" },
      { isEnabled },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}