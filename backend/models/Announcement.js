import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ["notice", "update", "job", "form"],
      required: true,
      index: true,
    },
    urls: [
      {
        heading: { type: String, trim: true },
        url: {
          type: String,
          validate: {
            validator: (v) => /^https?:\/\/.+/.test(v),
            message: (props) => `${props.value} is not a valid URL!`,
          },
        },
      },
    ],
    meta: [
      {
        key: { type: String, required: true, trim: true }, // dynamic field title
        value: { type: String, required: true },           // dynamic field value
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
