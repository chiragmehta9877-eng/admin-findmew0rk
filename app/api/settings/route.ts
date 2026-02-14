import { NextResponse } from 'next/server';
import { connectToDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Current settings fetch karo
export async function GET() {
  try {
    await connectToDB();
    
    // DB se pehla document uthao
    let settings = await Setting.findOne();

    // Agar nahi mila, toh naya banao
    if (!settings) {
        settings = await Setting.create({
            status: { production: false, netlify: false, localhost: false },
            maintenanceMessage: "We are currently upgrading."
        });
    }

    return NextResponse.json({ 
        success: true, 
        status: settings.status, 
        maintenanceMessage: settings.maintenanceMessage 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: Settings save karo
export async function POST(req: Request) {
    try {
        await connectToDB();
        const body = await req.json();

        console.log("📝 Update Request:", body);

        // CASE A: Toggle Environment (Localhost/Prod)
        if (body.environment) {
            // Seedha 'status.localhost' update karo
            const updateField = `status.${body.environment}`;
            
            const updated = await Setting.findOneAndUpdate({}, {
                $set: { [updateField]: body.isEnabled }
            }, { new: true, upsert: true });

            return NextResponse.json({ success: true, status: updated.status });
        }

        return NextResponse.json({ success: false, error: "Invalid Request" }, { status: 400 });

    } catch (error) {
        console.error("Save Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}