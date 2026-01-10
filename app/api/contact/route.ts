import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await connectToDB();
    
    await Contact.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}