import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/mongodb";
import ApiConfig from "@/models/ApiConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const config = await ApiConfig.findOne({ serviceName: "RapidAPI_Twitter" });

    if (!config || !config.apiKey) {
      return NextResponse.json({ error: "No API Key configured" }, { status: 400 });
    }

    // 🔥 Dummy Request to RapidAPI to get Headers (Costs 1 Request)
    const response = await axios.get(`https://twitter-api45.p.rapidapi.com/search.php`, {
      params: { query: 'test' }, // Dummy query
      headers: {
        'X-RapidAPI-Key': config.apiKey,
        'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com'
      }
    });

    // Capture Headers
    const limit = response.headers['x-ratelimit-requests-limit'];
    const remaining = response.headers['x-ratelimit-requests-remaining'];

    if (limit && remaining) {
      // Update Database with REAL numbers
      const updatedConfig = await ApiConfig.findOneAndUpdate(
        { serviceName: "RapidAPI_Twitter" },
        { 
          totalLimit: parseInt(limit),
          remaining: parseInt(remaining),
          lastUpdated: new Date()
        },
        { new: true }
      );

      return NextResponse.json({ success: true, data: updatedConfig });
    }

    return NextResponse.json({ success: false, message: "Headers not found" });

  } catch (error: any) {
    console.error("Sync Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to sync with RapidAPI" }, { status: 500 });
  }
}