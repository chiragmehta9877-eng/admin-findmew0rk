import axios from 'axios';
import ApiConfig from '@/models/ApiConfig';
import { connectToDB } from '@/lib/mongodb';

export async function fetchTwitterData(params: any) {
  await connectToDB();
  
  // 1. Get Dynamic Key
  // Pehle DB check karega, agar wahan nahi mili to ENV variable uthayega
  let apiKey = process.env.RAPID_API_KEY;
  const config = await ApiConfig.findOne({ serviceName: "RapidAPI_Twitter" });
  
  if (config && config.apiKey) {
    apiKey = config.apiKey;
  }

  if (!apiKey) {
    throw new Error("❌ API Key Missing! Please set RAPID_API_KEY in .env or Admin Panel.");
  }

  try {
    console.log(`📡 Calling RapidAPI with params:`, params);

    const response = await axios.get(`https://twitter-api45.p.rapidapi.com/search.php`, {
      params,
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com'
      }
    });

    // 2. 🔥 Automatic Usage Tracking (Background Update)
    // Response Headers se Limit aur Remaining quota nikal kar DB update kar raha hai
    const limit = response.headers['x-ratelimit-requests-limit'];
    const remaining = response.headers['x-ratelimit-requests-remaining'];

    if (limit && remaining) {
      console.log(`✅ Updating Quota: ${remaining}/${limit} remaining`);
      
      await ApiConfig.findOneAndUpdate(
        { serviceName: "RapidAPI_Twitter" },
        { 
          totalLimit: parseInt(limit),
          remaining: parseInt(remaining),
          lastUpdated: new Date(),
          // Agar record nahi hai to banate waqt key bhi save kar lo
          $setOnInsert: { apiKey: apiKey } 
        },
        { upsert: true, new: true }
      );
    }

    return response.data;

  } catch (error: any) {
    // Detailed Error Logging
    console.error("❌ Twitter API Error:", error.response?.data?.message || error.message);
    throw error;
  }
}