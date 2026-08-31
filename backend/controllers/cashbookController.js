import Transaction from "../models/Transaction.js";


// ============================================================
// ADD TRANSACTION
// ============================================================

export const addTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      paymentMode,
      description,
      customerName,
      customerPhone,

      // New field from frontend
      transactionDate,

      // Keep date also for backward compatibility
      date,
    } = req.body;


    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!type || !amount || !paymentMode) {
      return res.status(400).json({
        success: false,
        message:
          "Type, amount and payment mode are required.",
      });
    }


    // ----------------------------------------------------------
    // VALIDATE TYPE
    // ----------------------------------------------------------

    if (
      !["IN", "OUT"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction type must be IN or OUT.",
      });
    }


    // ----------------------------------------------------------
    // VALIDATE PAYMENT MODE
    // ----------------------------------------------------------

    if (
      !["Cash", "Online"].includes(
        paymentMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment mode must be Cash or Online.",
      });
    }


    // ----------------------------------------------------------
    // VALIDATE AMOUNT
    // ----------------------------------------------------------

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be greater than 0.",
      });
    }


    // ----------------------------------------------------------
    // TRANSACTION DATE
    //
    // Frontend sends:
    //
    // transactionDate: "2026-08-25"
    //
    // If transactionDate is not provided,
    // fall back to old `date` field.
    //
    // If neither exists, use current date/time.
    // ----------------------------------------------------------

    let finalTransactionDate =
      new Date();


    const selectedDate =
      transactionDate || date;


    if (selectedDate) {

      // If only YYYY-MM-DD is received,
      // preserve the selected date and use
      // current time.
      if (
        /^\d{4}-\d{2}-\d{2}$/.test(
          selectedDate
        )
      ) {

        const now =
          new Date();

        const [year, month, day] =
          selectedDate
            .split("-")
            .map(Number);

        finalTransactionDate =
          new Date(
            year,
            month - 1,
            day,
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
          );

      } else {

        const parsedDate =
          new Date(selectedDate);

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid transaction date.",
          });
        }

        finalTransactionDate =
          parsedDate;
      }
    }


    // ----------------------------------------------------------
    // CREATE TRANSACTION
    // ----------------------------------------------------------

    const transaction =
      await Transaction.create({

        type,

        amount:
          numericAmount,

        paymentMode,

        description:
          description?.trim() || "",

        customerName:
          customerName?.trim() || "",

        customerPhone:
          customerPhone?.trim() || "",

        date:
          finalTransactionDate,

        createdBy:
          req.user?._id || null,
      });


    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Transaction added successfully.",
      transaction,
    });

  } catch (error) {

    console.error(
      "Add transaction error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add transaction.",
    });
  }
};



// ============================================================
// GET CASHBOOK
// ============================================================

export const getCashbook = async (
  req,
  res
) => {

  try {

    // ----------------------------------------------------------
    // GET SELECTED DATE
    //
    // Cashbook frontend sends today's date by default.
    // ----------------------------------------------------------

    const selectedDate =
      req.query.date;


    let date;


    if (selectedDate) {

      // YYYY-MM-DD
      const [year, month, day] =
        selectedDate
          .split("-")
          .map(Number);

      date = new Date(
        year,
        month - 1,
        day
      );

    } else {

      date = new Date();
    }


    // ----------------------------------------------------------
    // START OF SELECTED DAY
    // ----------------------------------------------------------

    const startOfDay =
      new Date(date);

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );


    // ----------------------------------------------------------
    // END OF SELECTED DAY
    // ----------------------------------------------------------

    const endOfDay =
      new Date(date);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );


    // ==========================================================
    // SELECTED DAY TRANSACTIONS
    // ==========================================================

    const transactions =
      await Transaction.find({

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },

      })
        .sort({
          date: -1,
        })
        .lean();


    // ==========================================================
    // ALL TRANSACTIONS
    //
    // Used to calculate current balance.
    // ==========================================================

    const allTransactions =
      await Transaction.find({})
        .sort({
          date: 1,
        })
        .lean();


    // ==========================================================
    // ALL-TIME TOTALS
    // ==========================================================

    let totalIn = 0;

    let totalOut = 0;

    let cashIn = 0;

    let cashOut = 0;

    let onlineIn = 0;

    let onlineOut = 0;


    allTransactions.forEach(
      (transaction) => {

        const amount =
          Number(
            transaction.amount
          ) || 0;


        // ------------------------------------------------------
        // IN
        // ------------------------------------------------------

        if (
          transaction.type ===
          "IN"
        ) {

          totalIn += amount;


          if (
            transaction.paymentMode ===
            "Cash"
          ) {

            cashIn += amount;

          }


          if (
            transaction.paymentMode ===
            "Online"
          ) {

            onlineIn += amount;

          }

        }


        // ------------------------------------------------------
        // OUT
        // ------------------------------------------------------

        else if (
          transaction.type ===
          "OUT"
        ) {

          totalOut += amount;


          if (
            transaction.paymentMode ===
            "Cash"
          ) {

            cashOut += amount;

          }


          if (
            transaction.paymentMode ===
            "Online"
          ) {

            onlineOut += amount;

          }

        }

      }
    );


    // ==========================================================
    // SELECTED DATE TOTALS
    // ==========================================================

    let totalInForDate = 0;

    let totalOutForDate = 0;


    let cashInForDate = 0;

    let cashOutForDate = 0;


    let onlineInForDate = 0;

    let onlineOutForDate = 0;


    transactions.forEach(
      (transaction) => {

        const amount =
          Number(
            transaction.amount
          ) || 0;


        // ------------------------------------------------------
        // IN
        // ------------------------------------------------------

        if (
          transaction.type ===
          "IN"
        ) {

          totalInForDate +=
            amount;


          if (
            transaction.paymentMode ===
            "Cash"
          ) {

            cashInForDate +=
              amount;

          }


          if (
            transaction.paymentMode ===
            "Online"
          ) {

            onlineInForDate +=
              amount;

          }

        }


        // ------------------------------------------------------
        // OUT
        // ------------------------------------------------------

        else if (
          transaction.type ===
          "OUT"
        ) {

          totalOutForDate +=
            amount;


          if (
            transaction.paymentMode ===
            "Cash"
          ) {

            cashOutForDate +=
              amount;

          }


          if (
            transaction.paymentMode ===
            "Online"
          ) {

            onlineOutForDate +=
              amount;

          }

        }

      }
    );


    // ==========================================================
    // CURRENT BALANCES
    // ==========================================================

    const totalBalance =
      totalIn -
      totalOut;


    const cashBalance =
      cashIn -
      cashOut;


    const onlineBalance =
      onlineIn -
      onlineOut;


    // ==========================================================
    // SELECTED DATE BALANCE
    // ==========================================================

    const selectedDateBalance =
      totalInForDate -
      totalOutForDate;


    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(200).json({

      success: true,

      transactions,

      summary: {

        // Current overall balance
        totalBalance,

        // Selected day's balance
        selectedDateBalance,


        // Current cash balance
        cashBalance,

        // Current online balance
        onlineBalance,


        // Selected day's IN
        totalIn:
          totalInForDate,


        // Selected day's OUT
        totalOut:
          totalOutForDate,


        // Overall Cash
        cashIn,

        cashOut,


        // Overall Online
        onlineIn,

        onlineOut,


        // Selected day Cash
        cashInForDate,

        cashOutForDate,


        // Selected day Online
        onlineInForDate,

        onlineOutForDate,
      },

    });

  } catch (error) {

    console.error(
      "Cashbook error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to load cashbook.",

    });
  }
};