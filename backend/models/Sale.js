import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customerName: {
      type: String,
      default: "",
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    items: [
      {
        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    unpaidAmount: {
      type: Number,
      default: 0,
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Credit", "Partial"],
      default: "Cash",
    },

    date: {
      type: Date,
      default: Date.now,
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

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;