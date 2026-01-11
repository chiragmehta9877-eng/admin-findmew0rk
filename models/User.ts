import mongoose, { Schema, Document, Model } from "mongoose";

// 🔥 1. Bookmark ke liye alag interface banaya (Type safety ke liye)
interface IBookmark {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  source?: string;
  apply_link?: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: "super_admin" | "admin" | "user";
  isActive: boolean;

  // 🔥 PROFILE FIELDS (User Manual Entry)
  headline?: string;
  location?: string;
  lookingFor?: string;
  linkedin?: string;
  x_handle?: string;
  instagram?: string;

  // 🔥 TRACKING FIELDS (Auto Detected)
  ip?: string;
  detectedLocation?: string;
  lastLogin?: Date;

  // 🔥 UPDATED: Bookmarks ab poora Object store karega (Not just ID)
  bookmarks: IBookmark[];

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, default: "user" },
    isActive: { type: Boolean, default: true },

    // 🔥 PROFILE FIELDS
    headline: { type: String, default: "" },
    location: { type: String, default: "" },
    lookingFor: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    x_handle: { type: String, default: "" },
    instagram: { type: String, default: "" },

    // 🔥 TRACKING FIELDS
    ip: { type: String },
    detectedLocation: { type: String, default: "" },
    lastLogin: { type: Date },

    // 🔥 UPDATED: Bookmarks Schema (Embedded Object)
    bookmarks: [
      {
        job_id: { type: String }, // External API ki ID
        job_title: { type: String },
        employer_name: { type: String },
        employer_logo: { type: String },
        job_city: { type: String },
        source: { type: String },
        apply_link: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;