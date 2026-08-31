import Transaction from "../models/Transaction.js";

export const getSalesReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      paymentMode,
      type,
      search,
    } = req.query;

    const query = {};

    // Date Filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(`${startDate}T00:00:00`),
        $lte: new Date(`${endDate}T23:59:59.999`),
      };
    }

    // Payment Filter
    if (paymentMode && paymentMode !== "All") {
      query.paymentMode = paymentMode;
    }

    // IN / OUT Filter
    if (type && type !== "All") {
      query.type = type;
    }

    // Search Filter
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const transactions = await Transaction.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    let totalIn = 0;
    let totalOut = 0;
    let cashIn = 0;
    let onlineIn = 0;

    transactions.forEach((t) => {
      if (t.type === "IN") {
        totalIn += t.amount;

        if (t.paymentMode === "Cash") cashIn += t.amount;
        if (t.paymentMode === "Online") onlineIn += t.amount;
      }

      if (t.type === "OUT") {
        totalOut += t.amount;
      }
    });

    res.status(200).json({
      success: true,

      report: {
        transactions: transactions.length,
        netSale: totalIn,
        expense: totalOut,
        paidAmount: totalIn,
        unpaidBalance: 0,
        cashIn,
        onlineIn,
      },

      transactions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to load report",
    });
  }
};