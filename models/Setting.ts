import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  name: string;
  isEnabled: boolean;
}

const SettingSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true }, // e.g., "maintenance_mode"
  isEnabled: { type: Boolean, default: false },
});

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
export default Setting;