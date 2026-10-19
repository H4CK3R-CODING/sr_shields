import mongoose from "mongoose";
import Customer from "../models/Customer.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchCustomers = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (query.length < 2) return res.json({ success: true, customers: [] });
    const regex = new RegExp(escapeRegex(query), "i");
    const customers = await Customer.find({ $or: [{ name: regex }, { phone: regex }] })
      .sort({ name: 1 }).limit(10).select("name phone").lean();
    return res.json({ success: true, customers });
  } catch (error) {
    console.error("Search customers error:", error);
    return res.status(500).json({ success: false, message: "Unable to search customers." });
  }
};

export const upsertCustomer = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const customerId = req.body.customerId;
    if (!name) return res.status(400).json({ success: false, message: "Customer name is required." });

    let customer = null;
    if (customerId && mongoose.isValidObjectId(customerId)) customer = await Customer.findById(customerId);
    if (!customer && phone) customer = await Customer.findOne({ phone });
    if (!customer && !phone) {
      const exactName = new RegExp(`^${escapeRegex(name)}$`, "i");
      customer = await Customer.findOne({ name: exactName, phone: "" });
    }

    if (customer) {
      customer.name = name;
      if (phone) customer.phone = phone;
      await customer.save();
    } else {
      customer = await Customer.create({ name, phone, createdBy: req.user?._id || null });
    }
    return res.json({ success: true, message: "Customer saved successfully.", customer: { _id: customer._id, name: customer.name, phone: customer.phone } });
  } catch (error) {
    console.error("Upsert customer error:", error);
    return res.status(500).json({ success: false, message: "Unable to save customer." });
  }
};
