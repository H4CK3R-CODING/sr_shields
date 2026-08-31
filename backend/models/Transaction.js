import mongoose from "mongoose";

const transactionSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: ["IN", "OUT"],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      paymentMode: {
        type: String,
        enum: ["Cash", "Online"],
        required: true,
      },

      description: {
        type: String,
        default: "",
      },

      customerName: {
        type: String,
        default: "",
      },

      customerPhone: {
        type: String,
        default: "",
      },

      date: {
        type: Date,
        default: Date.now,
        required: true,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Transaction",
  transactionSchema
);