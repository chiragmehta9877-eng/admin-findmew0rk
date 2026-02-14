import mongoose, { Schema, Document, Model } from "mongoose";

// Interface definition
export interface ISetting extends Document {
  status: {
    production: boolean;
    netlify: boolean;
    localhost: boolean;
  };
  maintenanceMessage: string;
}

const SettingSchema = new Schema({
  // Hum seedha root level pe 'status' rakhenge
  status: {
    production: { type: Boolean, default: false },
    netlify: { type: Boolean, default: false },
    localhost: { type: Boolean, default: false },
  },
  maintenanceMessage: { type: String, default: "We are currently upgrading." },
}, { timestamps: true });

// 🔥 PURANA CACHE DELETE KARNA ZARURI HAI
if (mongoose.models.Setting) {
  delete mongoose.models.Setting;
}

const Setting: Model<ISetting> = mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;