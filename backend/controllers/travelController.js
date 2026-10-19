import mongoose from "mongoose";
import TravelBooking from "../models/TravelBooking.js";
import TravelCustomer from "../models/TravelCustomer.js";

const paymentStatusFor = (total, collected) => {
  if (collected <= 0) return "Unpaid";
  if (collected >= total) return "Paid";
  return "Partial";
};

const makeBookingId = async () => {
  const year = new Date().getFullYear();
  const prefix = `DG-${year}-`;
  const latest = await TravelBooking.findOne({ bookingId: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 }).select("bookingId").lean();
  const previous = latest ? Number(latest.bookingId.split("-").pop()) || 0 : 0;
  return `${prefix}${String(previous + 1).padStart(3, "0")}`;
};

async function findOrCreateCustomer({ customerId, clientName, contactNumber, email, userId }) {
  if (customerId && mongoose.isValidObjectId(customerId)) {
    const customer = await TravelCustomer.findById(customerId);
    if (customer) {
      if (contactNumber) customer.phone = contactNumber.trim();
      if (email) customer.email = email.trim().toLowerCase();
      if (clientName?.trim()) customer.name = clientName.trim();
      await customer.save();
      return customer;
    }
  }

  const name = clientName.trim();
  const phone = (contactNumber || "").trim();
  let customer = phone ? await TravelCustomer.findOne({ phone }) : null;
  if (!customer && email) customer = await TravelCustomer.findOne({ email: email.trim().toLowerCase() });
  if (!customer) {
    customer = await TravelCustomer.create({
      name, phone, email: (email || "").trim().toLowerCase(), createdBy: userId || null,
    });
  } else {
    customer.name = name || customer.name;
    if (phone) customer.phone = phone;
    if (email) customer.email = email.trim().toLowerCase();
    await customer.save();
  }
  return customer;
}

export const searchCustomers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    if (search.length < 2) return res.json({ success: true, customers: [] });
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const customers = await TravelCustomer.find({
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ],
    }).sort({ name: 1 }).limit(10).select("name phone email").lean();
    return res.json({ success: true, customers });
  } catch (error) {
    console.error("Search travel customers:", error);
    return res.status(500).json({ success: false, message: "Unable to search customers." });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      customerId, clientName, contactNumber, email, bookingDate, destination,
      travelDate, pax, ratePerPax, amountCollected, paymentMode, balanceDueDate,
      salesExecutive, notes,
    } = req.body;

    if (!String(clientName || "").trim() || !String(destination || "").trim() || !travelDate) {
      return res.status(400).json({ success: false, message: "Client name, destination and travel date are required." });
    }
    const guests = Number(pax);
    const rate = Number(ratePerPax);
    const collected = Number(amountCollected || 0);
    if (!Number.isInteger(guests) || guests < 1 || !Number.isFinite(rate) || rate < 0 || !Number.isFinite(collected) || collected < 0) {
      return res.status(400).json({ success: false, message: "Enter valid guest count, rate and amount collected." });
    }
    const total = guests * rate;
    if (collected > total) return res.status(400).json({ success: false, message: "Amount collected cannot exceed the booking total." });
    const travel = new Date(travelDate);
    if (Number.isNaN(travel.getTime())) return res.status(400).json({ success: false, message: "Invalid travel date." });

    const customer = await findOrCreateCustomer({
      customerId, clientName, contactNumber, email, userId: req.user?._id,
    });
    const status = paymentStatusFor(total, collected);
    const booking = await TravelBooking.create({
      bookingId: await makeBookingId(),
      customerId: customer._id,
      clientName: String(clientName).trim(),
      contactNumber: String(contactNumber || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
      destination: String(destination).trim(),
      travelDate: travel,
      pax: guests,
      ratePerPax: rate,
      totalAmount: total,
      amountCollected: collected,
      balanceDue: Math.max(0, total - collected),
      paymentMode: String(paymentMode || "UPI / GPay / PhonePe"),
      paymentStatus: status,
      balanceDueDate: balanceDueDate ? new Date(balanceDueDate) : null,
      salesExecutive: String(salesExecutive || "").trim(),
      notes: String(notes || "").trim(),
      payments: collected > 0 ? [{ amount: collected, paymentMode: String(paymentMode || "UPI / GPay / PhonePe"), recordedBy: req.user?._id || null }] : [],
      createdBy: req.user?._id || null,
    });
    return res.status(201).json({ success: true, message: "Booking registered successfully.", booking });
  } catch (error) {
    console.error("Create travel booking:", error);
    return res.status(500).json({ success: false, message: "Unable to create booking." });
  }
};

export const getDashboard = async (_req, res) => {
  try {
    const bookings = await TravelBooking.find({}).sort({ createdAt: -1 }).lean();
    const grossSales = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    const collected = bookings.reduce((sum, b) => sum + Number(b.amountCollected || 0), 0);
    const outstanding = bookings.reduce((sum, b) => sum + Number(b.balanceDue || 0), 0);
    const currentYear = new Date().getFullYear();
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: new Date(currentYear, i, 1).toLocaleString("en-IN", { month: "short" }),
      grossSales: 0,
      collected: 0,
    }));
    bookings.forEach((booking) => {
      const d = new Date(booking.bookingDate || booking.createdAt);
      if (d.getFullYear() === currentYear) {
        const bucket = monthly[d.getMonth()];
        bucket.grossSales += Number(booking.totalAmount || 0);
        bucket.collected += Number(booking.amountCollected || 0);
      }
    });
    return res.json({
      success: true,
      summary: {
        totalBookings: bookings.length, grossSales, collected, outstanding,
        collectionRate: grossSales > 0 ? (collected / grossSales) * 100 : 0,
      },
      monthly,
      bookings,
    });
  } catch (error) {
    console.error("Get travel dashboard:", error);
    return res.status(500).json({ success: false, message: "Unable to load travel dashboard." });
  }
};

export const addBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.amount);
    const paymentMode = String(req.body.paymentMode || "").trim();
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid booking ID." });
    if (!Number.isFinite(amount) || amount <= 0 || !paymentMode) {
      return res.status(400).json({ success: false, message: "Valid payment amount and mode are required." });
    }
    const booking = await TravelBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (amount > booking.balanceDue) return res.status(400).json({ success: false, message: "Payment cannot exceed the outstanding balance." });
    booking.payments.push({ amount, paymentMode, recordedBy: req.user?._id || null });
    booking.amountCollected += amount;
    booking.balanceDue = Math.max(0, booking.totalAmount - booking.amountCollected);
    booking.paymentStatus = paymentStatusFor(booking.totalAmount, booking.amountCollected);
    booking.paymentMode = paymentMode;
    await booking.save();
    return res.json({ success: true, message: "Payment recorded successfully.", booking });
  } catch (error) {
    console.error("Add travel payment:", error);
    return res.status(500).json({ success: false, message: "Unable to record payment." });
  }
};
