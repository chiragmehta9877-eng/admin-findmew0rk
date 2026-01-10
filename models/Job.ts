import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_country?: string;
  
  // Links
  apply_link?: string;
  job_url?: string;
  url?: string;
  link?: string;

  text?: string;
  source: "twitter" | "linkedin" | "manual";
  category: string;
  posted_at: Date;
  updated_by?: string; 

  // 🔥 NEW: Analytics Fields
  views: number;
  clicks: number;
}

const JobSchema: Schema = new Schema(
  {
    job_id: { type: String, required: true, unique: true },
    job_title: { type: String, required: true },
    employer_name: { type: String, required: true },
    employer_logo: { type: String },
    job_city: { type: String },
    job_country: { type: String },

    apply_link: { type: String },
    job_url: { type: String },
    url: { type: String },
    link: { type: String },

    text: { type: String },
    source: { type: String, required: true },
    category: { type: String, default: "General" },
    posted_at: { type: Date, default: Date.now },
    updated_by: { type: String, default: 'System' },

    // 🔥 NEW: Real Counters (Default 0)
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
export default Job;