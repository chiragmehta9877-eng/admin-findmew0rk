import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import ApiConfig from "@/models/ApiConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    let config = await ApiConfig.findOne({ serviceName: "RapidAPI_Twitter" });

    if (!config) {
      config = await ApiConfig.create({
        apiKey: process.env.RAPID_API_KEY || "",
        totalLimit: 500,
        remaining: 500
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        apiKey: config.apiKey, // 🔥 FIX: Ab hum poori key bhej rahe hain (Sirf Admin ko)
        totalLimit: config.totalLimit,
        remaining: config.remaining,
        lastUpdated: config.lastUpdated
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST function same rahega (No change needed there)
export async function POST(req: Request) {
    // ... (Purana code same rakhein) ...
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        const { newKey } = await req.json();
        if (!newKey) return NextResponse.json({ error: "Key is required" }, { status: 400 });
    
        await connectToDB();
        
        await ApiConfig.findOneAndUpdate(
          { serviceName: "RapidAPI_Twitter" },
          { 
            apiKey: newKey,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
    
        return NextResponse.json({ success: true, message: "API Key Updated Successfully!" });
    
      } catch (error) {
        return NextResponse.json({ error: "Update Failed" }, { status: 500 });
      }
}