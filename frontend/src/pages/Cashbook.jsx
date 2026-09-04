import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { Trash2, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Cashbook = () => {
  // ============================================================
  // GET TODAY
  // ============================================================

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // STATE
  // ============================================================

  const [transactions, setTransactions] = useState([]);

  const [summary, setSummary] = useState({
    totalBalance: 0,
    selectedDateBalance: 0,

    cashBalance: 0,
    onlineBalance: 0,

    totalIn: 0,
    totalOut: 0,

    cashIn: 0,
    cashOut: 0,

    onlineIn: 0,
    onlineOut: 0,
  });

  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [transactionType, setTransactionType] = useState("IN");

  const token = localStorage.getItem("token");

  // ============================================================
  // FORM DATA
  //
  // Transaction date defaults to TODAY.
  // ============================================================

  const [formData, setFormData] = useState({
    amount: "",
    paymentMode: "Online",
    description: "",
    customerName: "",
    customerPhone: "",
    transactionDate: getToday(),
  });

  // ============================================================
  // INITIAL LOAD
  //
  // Cashbook opens with today's transactions.
  // ============================================================

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
    });

    fetchCashbook();
  }, []);

  // ============================================================
  // FETCH TODAY'S CASHBOOK
  //
  // No date selector on top.
  // Default API call uses today's date.
  // ============================================================

  const fetchCashbook = async () => {
    try {
      setLoading(true);

      const today = getToday();

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/cashbook`,
        {
          params: {
            date: today,
          },

          withCredentials: true,

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data?.success) {
        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : [],
        );

        setSummary(
          data.summary || {
            totalBalance: 0,
            selectedDateBalance: 0,

            cashBalance: 0,
            onlineBalance: 0,

            totalIn: 0,
            totalOut: 0,

            cashIn: 0,
            cashOut: 0,

            onlineIn: 0,
            onlineOut: 0,
          },
        );
      } else {
        setTransactions([]);

        toast.error(data?.message || "Unable to load cashbook.");
      }
    } catch (error) {
      console.error("Cashbook Error:", error);

      toast.error(
        error.response?.data?.message || "❌ Backend not responding.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE TRANSACTION
  // ============================================================

  const handleDeleteTransaction = async (transactionId) => {
    if (!transactionId) {
      toast.error("Transaction ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/cashbook/${transactionId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data?.success) {
        toast.success(data.message || "Transaction deleted successfully.");

        // Refresh cashbook
        await fetchCashbook();
      } else {
        toast.error(data?.message || "Failed to delete transaction.");
      }
    } catch (error) {
      console.error("Delete transaction error:", error);

      toast.error(
        error.response?.data?.message || "❌ Failed to delete transaction.",
      );
    }
  };
  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // OPEN IN / OUT MODAL
  //
  // Every new transaction defaults to TODAY.
  // ============================================================

  const openTransactionModal = (type) => {
    setTransactionType(type);

    setFormData({
      amount: "",
      paymentMode: "Online",
      description: "",
      customerName: "",
      customerPhone: "",
      transactionDate: getToday(),
    });

    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowModal(false);
  };

  // ============================================================
  // ADD TRANSACTION
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // ----------------------------------------------------------
    // AMOUNT VALIDATION
    // ----------------------------------------------------------

    if (!formData.amount) {
      toast.error("⚠️ Please enter amount.");

      return;
    }

    if (Number(formData.amount) <= 0) {
      toast.error("⚠️ Amount must be greater than 0.");

      return;
    }

    // ----------------------------------------------------------
    // DATE VALIDATION
    // ----------------------------------------------------------

    if (!formData.transactionDate) {
      toast.error("⚠️ Please select transaction date.");

      return;
    }

    try {
      setIsSubmitting(true);

      // --------------------------------------------------------
      // PAYLOAD
      //
      // IMPORTANT:
      // transactionDate is sent to backend.
      // --------------------------------------------------------

      const payload = {
        type: transactionType,

        amount: Number(formData.amount),

        paymentMode: formData.paymentMode,

        description: formData.description.trim(),

        customerName: formData.customerName.trim(),

        customerPhone: formData.customerPhone.trim(),

        transactionDate: formData.transactionDate,
      };

      console.log("Cashbook transaction payload:", payload);

      // --------------------------------------------------------
      // API CALL
      // --------------------------------------------------------

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/cashbook/add`,
        payload,
        {
          withCredentials: true,

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      if (data?.success) {
        toast.success(
          data.message ||
            `${
              transactionType === "IN" ? "IN" : "OUT"
            } transaction added successfully!`,
        );

        setShowModal(false);

        // Reset form
        setFormData({
          amount: "",
          paymentMode: "Online",
          description: "",
          customerName: "",
          customerPhone: "",
          transactionDate: getToday(),
        });

        // ------------------------------------------------------
        // Refresh TODAY'S CASHBOOK
        //
        // If an older transaction was added,
        // it will NOT appear in today's list.
        // This is intentional because Cashbook page
        // shows today's transactions by default.
        // ------------------------------------------------------

        await fetchCashbook();
      } else {
        toast.error(data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Add Transaction Error:", error);

      toast.error(
        error.response?.data?.message || "❌ Backend not responding.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            text-center
          "
        >
          <div
            className="
              animate-spin
              rounded-full
              h-12
              w-12
              border-b-4
              border-blue-600
              mx-auto
            "
          />

          <p
            className="
              mt-4
              text-gray-500
              dark:text-gray-400
            "
          >
            Loading cashbook...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        pt-16
        pb-32
        px-4
        sm:px-6
        relative
      "
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* ======================================================
          BACKGROUND GLOW
      ======================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-sky-400/20
          via-indigo-500/10
          to-purple-600/20
          blur-3xl
          opacity-50
          -z-10
        "
      />

      <motion.div
        className="
          w-full
          max-w-5xl
          mx-auto
        "
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        {/* ==================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            mb-6
          "
          data-aos="fade-down"
        >
          <div>
            <h1
              className="
                text-3xl
                sm:text-5xl
                font-extrabold
                bg-gradient-to-r
                from-blue-600
                via-indigo-500
                to-purple-500
                bg-clip-text
                text-transparent
              "
            >
              Cashbook
            </h1>

            <p
              className="
                text-gray-500
                dark:text-gray-400
                mt-2
              "
            >
              Today's transactions
            </p>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchCashbook}
            className="
              w-11
              h-11
              rounded-full
              bg-white/80
              dark:bg-black/60
              backdrop-blur-xl
              border
              border-white/20
              dark:border-gray-700
              shadow-md
              hover:shadow-lg
              transition
              text-xl
            "
            title="Refresh"
          >
            ↻
          </button>
        </div>

        {/* ==================================================
            TODAY CARD
        =================================================== */}

        <motion.div
          className="
            bg-white/80
            dark:bg-black/60
            backdrop-blur-xl
            border
            border-white/20
            dark:border-gray-700
            rounded-2xl
            shadow-xl
            p-5
            mb-6
          "
          data-aos="fade-up"
        >
          <p
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Date
          </p>

          <p
            className="
              text-xl
              font-bold
              mt-1
            "
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </motion.div>

        {/* ==================================================
            BALANCE CARD
        =================================================== */}

        <motion.div
          className="
            w-full
            bg-white/80
            dark:bg-black/60
            backdrop-blur-xl
            border
            border-white/20
            dark:border-gray-700
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            overflow-hidden
            mb-6
          "
          data-aos="fade-up"
        >
          {/* CURRENT BALANCE */}

          <div
            className="
              p-6
              sm:p-8
              text-center
            "
          >
            <p
              className="
                text-gray-500
                dark:text-gray-400
              "
            >
              Current Balance
            </p>

            <h2
              className="
                text-4xl
                sm:text-5xl
                font-extrabold
                text-emerald-600
                mt-2
              "
            >
              ₹ {formatAmount(summary.totalBalance)}
            </h2>
          </div>

          {/* CASH / ONLINE */}

          <div
            className="
              grid
              grid-cols-2
              border-t
              border-gray-200
              dark:border-gray-700
            "
          >
            {/* CASH */}

            <div
              className="
                p-5
                sm:p-6
                border-r
                border-gray-200
                dark:border-gray-700
              "
            >
              <p
                className="
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Cash Balance
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mt-1
                "
              >
                ₹ {formatAmount(summary.cashBalance)}
              </p>
            </div>

            {/* ONLINE */}

            <div
              className="
                p-5
                sm:p-6
              "
            >
              <p
                className="
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Online Balance
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-emerald-600
                  mt-1
                "
              >
                ₹ {formatAmount(summary.onlineBalance)}
              </p>
            </div>
          </div>

          {/* TODAY IN / OUT */}

          <div
            className="
              grid
              grid-cols-2
              border-t
              border-gray-200
              dark:border-gray-700
            "
          >
            {/* IN */}

            <div
              className="
                p-5
                border-r
                border-gray-200
                dark:border-gray-700
              "
            >
              <p
                className="
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Today's IN
              </p>

              <p
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-emerald-600
                  mt-1
                "
              >
                + ₹ {formatAmount(summary.totalIn)}
              </p>
            </div>

            {/* OUT */}

            <div
              className="
                p-5
              "
            >
              <p
                className="
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Today's OUT
              </p>

              <p
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-red-500
                  mt-1
                "
              >
                - ₹ {formatAmount(summary.totalOut)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ==================================================
            TODAY'S TRANSACTIONS
        =================================================== */}

        <motion.div
          className="
            w-full
            bg-white/80
            dark:bg-black/60
            backdrop-blur-xl
            border
            border-white/20
            dark:border-gray-700
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            overflow-hidden
          "
          data-aos="fade-up"
        >
          {/* HEADER */}

          <div
            className="
              px-5
              py-4
              border-b
              border-gray-200
              dark:border-gray-700
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-bold
                "
              >
                Today's Transactions
              </h2>

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-1
                "
              >
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div
              className="
                text-sm
                text-gray-500
              "
            >
              {getToday()}
            </div>
          </div>

          {/* EMPTY */}

          {transactions.length === 0 ? (
            <div
              className="
                py-24
                text-center
                px-5
              "
            >
              <div
                className="
                  text-7xl
                  mb-6
                "
              >
                📦
              </div>

              <p
                className="
                  text-xl
                  font-medium
                "
              >
                No transactions today
              </p>

              <p
                className="
                  text-gray-500
                  dark:text-gray-400
                  mt-2
                "
              >
                Add an IN or OUT transaction using the buttons below.
              </p>
            </div>
          ) : (
            <div>
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="
                      px-5
                      py-4
                      border-b
                      border-gray-200
                      dark:border-gray-700
                      flex
                      items-center
                      justify-between
                      gap-4
                      hover:bg-gray-50
                      dark:hover:bg-gray-900
                      transition
                    "
                >
                  {/* LEFT */}

                  <div
                    className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                      "
                  >
                    {/* TYPE ICON */}

                    <div
                      className={`
                          w-11
                          h-11
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-white
                          text-xl
                          font-bold
                          flex-shrink-0
                          ${
                            transaction.type === "IN"
                              ? "bg-emerald-600"
                              : "bg-red-500"
                          }
                        `}
                    >
                      {transaction.type === "IN" ? "+" : "−"}
                    </div>

                    {/* DETAILS */}

                    <div
                      className="
                          min-w-0
                        "
                    >
                      <p
                        className="
                            font-semibold
                            truncate
                          "
                      >
                        {transaction.description ||
                          transaction.customerName ||
                          "Transaction"}
                      </p>

                      <div
                        className="
                            flex
                            flex-wrap
                            gap-2
                            text-xs
                            text-gray-500
                            mt-1
                          "
                      >
                        <span>{formatTime(transaction.date)}</span>

                        <span>•</span>

                        <span>{transaction.paymentMode || "-"}</span>
                      </div>

                      {/* CUSTOMER */}

                      {transaction.customerName && (
                        <p
                          className="
                              text-xs
                              text-gray-500
                              mt-1
                            "
                        >
                          Customer: {transaction.customerName}
                        </p>
                      )}

                      {transaction.customerPhone && (
                        <p
                          className="
                              text-xs
                              text-gray-500
                            "
                        >
                          {transaction.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE */}

                  <div
                    className="
    flex
    items-center
    gap-3
    flex-shrink-0
  "
                  >
                    {/* AMOUNT */}

                    <div className="text-right">
                      <p
                        className={`
        text-lg
        sm:text-xl
        font-bold
        ${transaction.type === "IN" ? "text-emerald-600" : "text-red-500"}
      `}
                      >
                        {transaction.type === "IN" ? "+" : "-"}₹{" "}
                        {formatAmount(transaction.amount)}
                      </p>

                      <p
                        className="
        text-xs
        text-gray-400
        mt-1
      "
                      >
                        {formatDate(transaction.date)}
                      </p>
                    </div>

                    {/* DELETE BUTTON */}

                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(transaction._id)}
                      className="
      w-9
      h-9
      rounded-lg
      flex
      items-center
      justify-center
      text-red-500
      bg-red-500/10
      hover:bg-red-500
      hover:text-white
      border
      border-red-500/20
      transition-all
      duration-200
      active:scale-90
    "
                      title="Delete transaction"
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ========================================================
          FIXED IN / OUT BUTTONS
      ========================================================= */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-40
          bg-white/90
          dark:bg-black/90
          backdrop-blur-xl
          border-t
          border-gray-200
          dark:border-gray-700
          p-4
        "
      >
        <div
          className="
            max-w-5xl
            mx-auto
            grid
            grid-cols-2
            gap-4
          "
        >
          {/* OUT BUTTON */}

          <motion.button
            type="button"
            whileTap={{
              scale: 0.96,
            }}
            onClick={() => openTransactionModal("OUT")}
            className="
              py-4
              bg-red-600
              hover:bg-red-700
              text-white
              rounded-xl
              font-bold
              text-lg
              shadow-lg
              transition
            "
          >
            − &nbsp; OUT
          </motion.button>

          {/* IN BUTTON */}

          <motion.button
            type="button"
            whileTap={{
              scale: 0.96,
            }}
            onClick={() => openTransactionModal("IN")}
            className="
              py-4
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              rounded-xl
              font-bold
              text-lg
              shadow-lg
              transition
            "
          >
            + &nbsp; IN
          </motion.button>
        </div>
      </div>

      {/* ========================================================
          ADD TRANSACTION MODAL
      ========================================================= */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/60
            backdrop-blur-sm
            flex
            items-end
            sm:items-center
            justify-center
          "
          onClick={closeModal}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 100,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full
              sm:max-w-lg
              max-h-[90vh]
              overflow-y-auto
              bg-white
              dark:bg-gray-950
              rounded-t-3xl
              sm:rounded-3xl
              shadow-2xl
              p-6
            "
          >
            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                mb-6
              "
            >
              <div>
                <h2
                  className={`
                    text-2xl
                    font-extrabold
                    ${
                      transactionType === "IN"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }
                  `}
                >
                  {transactionType === "IN"
                    ? "Add IN Transaction"
                    : "Add OUT Transaction"}
                </h2>

                <p
                  className="
                    text-sm
                    text-gray-500
                    dark:text-gray-400
                    mt-1
                  "
                >
                  Enter transaction details
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-gray-100
                  dark:bg-gray-800
                  text-gray-500
                  hover:text-gray-900
                  dark:hover:text-white
                  transition
                  text-xl
                "
              >
                ×
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="
                space-y-4
              "
            >
              {/* =================================================
                  AMOUNT
              ================================================== */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                    mb-2
                  "
                >
                  Amount
                </label>

                <div
                  className="
                    relative
                  "
                >
                  <span
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                      font-semibold
                    "
                  >
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    required
                    placeholder="Enter amount"
                    className="
                      w-full
                      pl-9
                      pr-4
                      py-3
                      rounded-xl
                      border
                      border-gray-300
                      dark:border-gray-600
                      bg-white/90
                      dark:bg-gray-900
                      text-gray-900
                      dark:text-white
                      outline-none
                      focus:ring-2
                      focus:ring-sky-500
                      transition
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  TRANSACTION DATE
              ================================================== */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                    mb-2
                  "
                >
                  Transaction Date
                </label>

                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-600
                    bg-white/90
                    dark:bg-gray-900
                    text-gray-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    transition
                  "
                />

                <p
                  className="
                    text-xs
                    text-gray-500
                    dark:text-gray-400
                    mt-2
                  "
                >
                  Default date is today. You can select another date if
                  required.
                </p>
              </div>

              {/* =================================================
                  PAYMENT MODE
              ================================================== */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                    mb-2
                  "
                >
                  Payment Mode
                </label>

                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-600
                    bg-white
                    dark:bg-gray-900
                    text-gray-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                  "
                >
                  <option value="Cash">Cash</option>

                  <option value="Online">Online</option>
                </select>
              </div>

              {/* =================================================
                  CUSTOMER NAME
              ================================================== */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                    mb-2
                  "
                >
                  Customer Name
                  <span
                    className="
                      text-gray-400
                      font-normal
                      ml-1
                    "
                  >
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-600
                    bg-white/90
                    dark:bg-gray-900
                    text-gray-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    transition
                  "
                />
              </div>

              {/* =================================================
                  CUSTOMER PHONE
              ================================================== */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                    mb-2
                  "
                >
                  Customer Phone
                  <span
                    className="
                      text-gray-400
                      font-normal
                      ml-1
                    "
                  >
                    (Optional)
                  </span>
                </label>

                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-600
                    bg-white/90
                    dark:bg-gray-900
                    text-gray-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    transition
                  "
                />
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                    mb-2
                  "
                >
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder={
                    transactionType === "IN"
                      ? "Example: Cash received from customer"
                      : "Example: Electricity payment"
                  }
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-600
                    bg-white/90
                    dark:bg-gray-900
                    text-gray-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-purple-500
                    resize-none
                    transition
                  "
                />
              </div>

              {/* =================================================
                  SELECTED DATE SUMMARY
              ================================================== */}

              <div
                className="
                  rounded-xl
                  bg-gray-50
                  dark:bg-gray-900
                  border
                  border-gray-200
                  dark:border-gray-800
                  px-4
                  py-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-sm
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    Transaction Date
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-gray-800
                      dark:text-gray-200
                    "
                  >
                    {formData.transactionDate
                      ? formatDate(`${formData.transactionDate}T00:00:00`)
                      : "--"}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mt-2
                  "
                >
                  <span
                    className="
                      text-sm
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    Transaction Type
                  </span>

                  <span
                    className={`
                      text-sm
                      font-bold
                      ${
                        transactionType === "IN"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }
                    `}
                  >
                    {transactionType}
                  </span>
                </div>
              </div>

              {/* =================================================
                  SUBMIT BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full
                  py-4
                  rounded-xl
                  text-white
                  font-bold
                  text-lg
                  shadow-lg
                  transition
                  active:scale-95
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  ${
                    transactionType === "IN"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                `}
              >
                {isSubmitting
                  ? "Saving..."
                  : transactionType === "IN"
                    ? "Add IN Transaction"
                    : "Add OUT Transaction"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cashbook;
