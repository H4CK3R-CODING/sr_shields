import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    paymentMode: { type: String, required: true, trim: true },
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: true }
);

const travelBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "TravelCustomer", default: null, index: true },
    clientName: { type: String, required: true, trim: true, index: true },
    contactNumber: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    bookingDate: { type: Date, default: Date.now, required: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    pax: { type: Number, required: true, min: 1 },
    ratePerPax: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountCollected: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    paymentMode: { type: String, default: "UPI / GPay / PhonePe", trim: true },
    paymentStatus: { type: String, enum: ["Paid", "Partial", "Unpaid"], default: "Unpaid" },
    balanceDueDate: { type: Date, default: null },
    salesExecutive: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    payments: { type: [paymentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

travelBookingSchema.index({ clientName: 1, travelDate: -1 });
travelBookingSchema.index({ bookingDate: -1 });

export default mongoose.model("TravelBooking", travelBookingSchema);
