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

    // Agar nahi mila, toh naya banao (Default values ke sath)
    if (!settings) {
        settings = await Setting.create({
            status: { production: false, netlify: false, localhost: false },
            maintenanceMessage: "We are currently upgrading."
        });
    }

    return NextResponse.json({ 
        success: true, 
        status: settings.status || {}, 
        maintenanceMessage: settings.maintenanceMessage 
    });

  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
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
            
            // 🔥 FIX: Backticks ka use karein dynamic key ke liye
            // Example: "status.localhost"
            const updateField = `status.${body.environment}`;
            
            // MongoDB mein nested field update karne ke liye [updateField] syntax zaroori hai
            const updated = await Setting.findOneAndUpdate(
                {}, // Empty filter matlab pehla document
                { 
                    $set: { [updateField]: body.isEnabled } 
                }, 
                { new: true, upsert: true } // new: true returns updated doc, upsert creates if missing
            );

            return NextResponse.json({ success: true, status: updated.status });
        }

        return NextResponse.json({ success: false, error: "Invalid Request: 'environment' missing" }, { status: 400 });

    } catch (error) {
        console.error("Save Error:", error);

        // 🔥 FIX: TypeScript 'unknown' error fix
        const message = error instanceof Error ? error.message : String(error);

        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}