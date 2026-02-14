import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import ApiConfig from "@/models/ApiConfig";
import axios from "axios";

// 🔥 1. CONFIG
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// 🔥 2. SMART KEYWORD EXPANSION
const CATEGORY_EXPANSION: Record<string, string[]> = {
  software: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack", "ReactJS", "NodeJS", "Python Developer", "DevOps"],
  finance: ["Financial Analyst", "Accountant", "Tax Consultant", "Finance Manager", "Auditor", "Investment Banking"],
  management: ["Product Manager", "Project Manager", "Business Analyst", "Operations Manager", "Scrum Master", "MBA Intern"],
  hr: ["HR Manager", "Technical Recruiter", "Talent Acquisition", "HR Executive"],
  marketing: ["Digital Marketing", "Social Media Manager", "SEO Specialist", "Content Writer", "Copywriter", "Brand Manager"],
  design: ["Graphic Designer", "UI UX Designer", "Video Editor", "Motion Graphics"],
  internship: ["Summer Intern", "Software Intern", "Marketing Intern", "Finance Intern", "College Intern"],
  freelance: ["Freelance Writer", "Freelance Developer", "Video Editor", "Ghostwriter"],
  esg: ["ESG Analyst", "Sustainability Manager", "Environmental Engineer", "Climate Tech"],
  other: ["Virtual Assistant", "Data Entry", "Customer Support", "Sales Executive"]
};

// 🔥 3. HIRING INTENT & STRICT CONTACT FILTERS
const HIRING_QUERY_PART = `("hiring" OR "looking for" OR "open role" OR "job opening" OR "hiring alert" OR "remote job" OR "urgent hiring")`;
const CONTACT_QUERY_PART = `(email OR gmail OR "send cv" OR "send resume" OR "apply at")`;

// ============================================================
// 🔥 4. HELPER: DEEP HISTORY SCRAPER
// ============================================================
async function fetchJobsFromTwitter(category: string, userQuery: string, targetLimit: number) {
  const config = await ApiConfig.findOne({ serviceName: "RapidAPI_Twitter" });
  if (!config || !config.apiKey) {
    throw new Error("❌ API Key missing in DB!");
  }

  // ✅ Valid Email Regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  let allFormattedJobs: any[] = [];
  const startTime = Date.now();
  const MAX_TIME = 55 * 1000; 

  // 🛠️ BUILD SMART QUEUE
  const cleanUserQuery = userQuery.replace(/ hiring$/i, "").trim(); 
  let searchQueue: string[] = [];

  if (cleanUserQuery && cleanUserQuery.toLowerCase() !== category.toLowerCase()) {
      searchQueue.push(cleanUserQuery);
  }

  const expansionKeywords = CATEGORY_EXPANSION[category.toLowerCase()] || [];
  if (expansionKeywords.length > 0) {
      searchQueue = [...searchQueue, ...expansionKeywords.slice(0, 3)];
  }

  if (searchQueue.length === 0) {
      searchQueue.push(category);
  }

  searchQueue = [...new Set(searchQueue)];

  console.log(`[SCRAPER] 🏎️ Queue:`, searchQueue);

  // 🔄 MAIN LOOP
  for (const currentTerm of searchQueue) {
    if (Date.now() - startTime > MAX_TIME) break;
    if (allFormattedJobs.length >= 200) break; 

    console.log(`\n[STRATEGY] 🔍 Searching: "${currentTerm}"`);
    
    let nextCursor: string | null = null;
    let strategyPages = 0;
    const MAX_PAGES_PER_STRATEGY = 4; // Increased pages to dig deeper

    // 🔄 PAGINATION LOOP
    do {
      if (Date.now() - startTime > MAX_TIME) break;

      const apiQuery = `(${currentTerm}) ${HIRING_QUERY_PART} ${CONTACT_QUERY_PART} -filter:retweets`;

      const options: any = {
        method: 'GET',
        url: 'https://twitter-api45.p.rapidapi.com/search.php',
        params: {
          query: apiQuery,
          // 🔥 UPDATE: Fetch 100 tweets per call instead of 40
          limit: 100, 
        },
        headers: {
          'x-rapidapi-key': config.apiKey,
          'x-rapidapi-host': 'twitter-api45.p.rapidapi.com'
        }
      };

      if (nextCursor) options.params.cursor = nextCursor;

      try {
        const response = await axios.request(options);
        const data = response.data;
        const rawTweets = data.timeline || data.tweets || data || [];

        nextCursor = data.next_cursor || data.meta?.next_token || null;

        // 🔥 STRICT EMAIL FILTER
        const validBatch = rawTweets.filter((t: any) => {
            const text = t.text || t.full_text || "";
            const isDuplicate = allFormattedJobs.some(j => j.job_id === `tw-${t.tweet_id || t.id}`);
            const hasEmail = emailRegex.test(text);
            return hasEmail && !t.in_reply_to_status_id && !isDuplicate;
        });

        // Format
        const formattedBatch = validBatch.map((t: any) => {
            const text = t.text || t.full_text || "";
            const extractedEmail = text.match(emailRegex)?.[0] || "";

            return {
                job_id: `tw-${t.tweet_id || t.id}`,
                job_title: `${currentTerm} Opportunity`, 
                employer_name: t.user_info?.name || t.screen_name || "X User",
                employer_logo: t.user_info?.avatar || "", 
                category: category,
                work_mode: (text.toLowerCase().includes('remote') || text.toLowerCase().includes('wfh')) ? 'Remote' : 'Onsite',
                country: "Global",
                post_date: t.created_at ? new Date(t.created_at) : new Date(),
                text: text,
                apply_link: `mailto:${extractedEmail}`,
                source: "twitter",
                isSpotlight: false,
                views: 0,
                clicks: 0
            };
        });

        allFormattedJobs = [...allFormattedJobs, ...formattedBatch];
        console.log(`   ➜ [PAGE ${strategyPages + 1}] Fetched batch. Valid Email Jobs: ${formattedBatch.length}`);
        
        await ApiConfig.findOneAndUpdate({ serviceName: "RapidAPI_Twitter" }, { $inc: { remaining: -1 } });

        strategyPages++;

        if (!nextCursor || strategyPages >= MAX_PAGES_PER_STRATEGY) {
            console.log("   👉 Next Keyword...");
            break; 
        }

      } catch (err: any) {
        console.error("   ❌ API Error:", err.message);
        break; 
      }

    } while (Date.now() - startTime < MAX_TIME); 
  }

  return allFormattedJobs;
}

// ============================================================
// 5. GET HANDLER
// ============================================================
export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "job";
    const source = searchParams.get("source");
    const refresh = searchParams.get("refresh") === "true"; 
    const limit = parseInt(searchParams.get("limit") || "20"); 
    const query = searchParams.get("query") || ""; 

    // 🔥 FIX DB TRIGGER (Run this via browser manually if needed: /api/jobs?fix_db=true)
    if (searchParams.get("fix_db") === "true") {
        console.log("🔧 Running DB Repair...");
        const result = await Job.updateMany(
            { views: { $exists: false } },
            { $set: { views: 0, clicks: 0 } }
        );
        return NextResponse.json({ success: true, message: `Fixed ${result.modifiedCount} jobs.` });
    }

    if (refresh) {
      console.log(`[API] ⚡ History Search: ${query} (Cat: ${category})`);
      try {
        const newJobs = await fetchJobsFromTwitter(category, query, limit);
        
        let addedCount = 0;
        for (const job of newJobs) {
          // 🔥 DUPLICATE CHECK
          const exists = await Job.findOne({ job_id: job.job_id });
          if (!exists) {
            await Job.create(job);
            addedCount++;
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: `History Search Done. Scanned ${newJobs.length} matches.`, 
          data: newJobs, 
          added: addedCount, // Only new unique jobs
          total: await Job.countDocuments() 
        });

      } catch (scrapingError: any) {
        return NextResponse.json({ success: false, error: scrapingError.message });
      }
    }

    // Standard Read Logic
    let dbQuery: any = {};
    if (category !== "job" && category !== "all" && category !== "All Categories") {
        dbQuery.category = { $regex: category, $options: "i" }; 
    }
    if (source && source !== 'all') dbQuery.source = source;
    if (query) {
      dbQuery.$or = [
        { job_title: { $regex: query, $options: "i" } },
        { text: { $regex: query, $options: "i" } }
      ];
    }

    const jobs = await Job.find(dbQuery).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json({ success: true, data: jobs });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Standard handlers
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const newJob = await Job.create({ ...body, job_id: `manual-${Date.now()}`, posted_at: new Date() });
    return NextResponse.json({ success: true, data: newJob });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { id } = await req.json();
    await Job.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}

// ============================================================
// 🔥 PATCH: SUPER DEBUG MODE (Handles Views & Clicks)
// ============================================================
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    console.log("\n🟡 [PATCH API HIT]");
    console.log("👉 Action:", body.action);
    console.log("👉 Job ID Recieved:", body.job_id);

    if (!body.job_id) {
        console.log("❌ Error: No Job ID provided in request body.");
        return NextResponse.json({ success: false, message: "No Job ID" });
    }

    let updateField = {};
    if (body.action === 'view') updateField = { $inc: { views: 1 } };
    else if (body.action === 'click') updateField = { $inc: { clicks: 1 } };
    else {
        // Fix Links Logic (Legacy)
        await Job.collection.updateMany(
            { apply_link: { $exists: true } }, 
            [{ $set: { job_url: "$apply_link", url: "$apply_link" } }]
        );
        return NextResponse.json({ success: true, message: "Links Fixed" });
    }

    // 🔥 MASTER SEARCH: Try matching 'job_id' OR '_id'
    // This fixes the issue if the DB has IDs in one format but Frontend sends another
    const job = await Job.findOneAndUpdate(
        { 
            $or: [
                { job_id: body.job_id }, // Match custom job_id (e.g. 'tw-12345')
                { _id: body.job_id }     // Match MongoDB _id (e.g. '65b...')
            ]
        }, 
        updateField,
        { new: true } // Return updated document
    );

    if (!job) {
        console.log("❌ JOB NOT FOUND IN DB!");
        console.log("💡 Tip: Check if your DB actually has a job with this ID.");
        return NextResponse.json({ success: false, message: "Job not found in DB" });
    }

    console.log("✅ SUCCESS! Database Updated.");
    console.log(`📊 New Stats -> Views: ${job.views}, Clicks: ${job.clicks}`);
    
    return NextResponse.json({ success: true, views: job.views, clicks: job.clicks });

  } catch (error: any) { 
      console.error("🔥 FATAL ERROR:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 }); 
  }
}