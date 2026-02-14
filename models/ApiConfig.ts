import mongoose, { Schema, Model } from "mongoose";

const ApiConfigSchema = new Schema({
  serviceName: { type: String, default: "RapidAPI_Twitter", unique: true },
  apiKey: { type: String, required: true },
  
  // Usage tracking from Headers
  totalLimit: { type: Number, default: 500 }, // Default monthly limit
  remaining: { type: Number, default: 500 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const ApiConfig: Model<any> = mongoose.models.ApiConfig || mongoose.model("ApiConfig", ApiConfigSchema);
export default ApiConfig;