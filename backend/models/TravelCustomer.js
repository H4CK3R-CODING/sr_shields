import mongoose from "mongoose";

const travelCustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true, index: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

travelCustomerSchema.index({ name: "text", phone: "text", email: "text" });

export default mongoose.model("TravelCustomer", travelCustomerSchema);
