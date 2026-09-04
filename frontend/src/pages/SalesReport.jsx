import React, { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { motion } from "framer-motion";

import AOS from "aos";
import "aos/dist/aos.css";

import axios from "axios";

import toast, { Toaster } from "react-hot-toast";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const SalesReport = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [duration, setDuration] = useState("This Month");

  const [showDuration, setShowDuration] = useState(false);

  const [loading, setLoading] = useState(true);

  const [pdfLoading, setPdfLoading] = useState(false);

  // All transactions returned by backend
  const [sales, setSales] = useState([]);

  const [transactionType, setTransactionType] = useState("All");

  const [report, setReport] = useState({
    transactions: 0,
    netSale: 0,
    paidAmount: 0,
    unpaidBalance: 0,
  });

  const [showCustomDate, setShowCustomDate] = useState(false);

  const [customStartDate, setCustomStartDate] = useState("");

  const [customEndDate, setCustomEndDate] = useState("");

  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  });

  const [paymentMode, setPaymentMode] = useState("All");

  // Search typed by user
  const [search, setSearch] = useState("");

  // Search actually applied after Search button / Enter
  const [appliedSearch, setAppliedSearch] = useState("");

  const token = localStorage.getItem("token");

  // ============================================================
  // AOS
  // ============================================================

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });

    fetchReport("This Month", "All", "All");
  }, []);

  // ============================================================
  // LOCAL DATE FORMAT
  // ============================================================

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // GET DATE RANGE
  // ============================================================

  const getDateRange = (selectedDuration) => {
    const now = new Date();

    let startDate;
    let endDate;

    switch (selectedDuration) {
      // --------------------------------------------------------
      // THIS YEAR
      // --------------------------------------------------------

      case "This year":
        startDate = new Date(now.getFullYear(), 0, 1);

        endDate = new Date(now.getFullYear(), 11, 31);

        break;

      // --------------------------------------------------------
      // THIS QUARTER
      // --------------------------------------------------------

      case "This quarter": {
        const quarter = Math.floor(now.getMonth() / 3);

        const quarterStartMonth = quarter * 3;

        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);

        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0);

        break;
      }

      // --------------------------------------------------------
      // THIS MONTH
      // --------------------------------------------------------

      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        break;

      // --------------------------------------------------------
      // LAST MONTH
      // --------------------------------------------------------

      case "Last Month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        endDate = new Date(now.getFullYear(), now.getMonth(), 0);

        break;

      // --------------------------------------------------------
      // THIS WEEK
      // --------------------------------------------------------

      case "This week": {
        const day = now.getDay();

        const difference = day === 0 ? 6 : day - 1;

        startDate = new Date(now);

        startDate.setDate(now.getDate() - difference);

        endDate = new Date(now);

        break;
      }

      // --------------------------------------------------------
      // YESTERDAY
      // --------------------------------------------------------

      case "Yesterday":
        startDate = new Date(now);

        startDate.setDate(now.getDate() - 1);

        endDate = new Date(startDate);

        break;

      // --------------------------------------------------------
      // TODAY
      // --------------------------------------------------------

      case "Today":
        startDate = new Date(now);

        endDate = new Date(now);

        break;

      // --------------------------------------------------------
      // DEFAULT
      // --------------------------------------------------------

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return {
      startDate: formatDateForAPI(startDate),

      endDate: formatDateForAPI(endDate),
    };
  };

  // ============================================================
  // FETCH REPORT
  //
  // IMPORTANT:
  // Search is NOT sent as transaction type.
  // Backend handles date/payment/type.
  // Frontend handles text search.
  // ============================================================

  const fetchReport = async (
    selectedDuration = duration,
    selectedPayment = paymentMode,
    selectedType = transactionType,
  ) => {
    try {
      setLoading(true);

      const range = getDateRange(selectedDuration);

      setDates(range);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/sales-report`,
        {
          params: {
            startDate: range.startDate,

            endDate: range.endDate,

            paymentMode: selectedPayment,

            type: selectedType,
          },

          withCredentials: true,

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data?.success) {
        setSales(Array.isArray(data.transactions) ? data.transactions : []);

        setReport(
          data.report || {
            transactions: 0,
            netSale: 0,
            paidAmount: 0,
            unpaidBalance: 0,
          },
        );
      } else {
        setSales([]);

        setReport({
          transactions: 0,
          netSale: 0,
          paidAmount: 0,
          unpaidBalance: 0,
        });

        toast.error(data?.message || "Unable to load report.");
      }
    } catch (error) {
      console.error("Sales Report Error:", error);

      toast.error(error.response?.data?.message || "Backend not responding");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE DURATION
  // ============================================================

  const handleDurationChange = (value) => {
    if (value === "Custom Date") {
      setShowDuration(false);

      // Set default custom dates if empty
      if (!customStartDate) {
        setCustomStartDate(dates.startDate);
      }

      if (!customEndDate) {
        setCustomEndDate(dates.endDate);
      }

      setShowCustomDate(true);

      return;
    }

    setDuration(value);

    setShowDuration(false);

    setAppliedSearch("");

    fetchReport(value, paymentMode, transactionType);
  };
  const handleCustomDateApply = async () => {
    if (!customStartDate || !customEndDate) {
      toast.error("Please select both dates.");
      return;
    }

    if (customStartDate > customEndDate) {
      toast.error("Start date cannot be after end date.");
      return;
    }

    try {
      setLoading(true);

      setDuration("Custom Date");

      setDates({
        startDate: customStartDate,
        endDate: customEndDate,
      });

      setAppliedSearch("");

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/sales-report`,
        {
          params: {
            startDate: customStartDate,
            endDate: customEndDate,
            paymentMode: paymentMode,
            type: transactionType,
          },

          withCredentials: true,

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data?.success) {
        setSales(Array.isArray(data.transactions) ? data.transactions : []);

        setReport(
          data.report || {
            transactions: 0,
            netSale: 0,
            paidAmount: 0,
            unpaidBalance: 0,
          },
        );

        setShowCustomDate(false);

        toast.success("Custom date report loaded.");
      } else {
        setSales([]);

        setReport({
          transactions: 0,
          netSale: 0,
          paidAmount: 0,
          unpaidBalance: 0,
        });

        toast.error(data?.message || "Unable to load report.");
      }
    } catch (error) {
      console.error("Custom date report error:", error);

      toast.error(error.response?.data?.message || "Backend not responding.");
    } finally {
      setLoading(false);
    }
  };
  // ============================================================
  // PAYMENT FILTER
  // ============================================================

  const handlePaymentModeChange = (value) => {
    setPaymentMode(value);

    fetchReport(duration, value, transactionType);

    // Keep input but reset currently applied search
    setAppliedSearch("");
  };

  // ============================================================
  // SEARCH INPUT
  // ============================================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // ============================================================
  // APPLY SEARCH
  // ============================================================

  const handleSearchClick = () => {
    setAppliedSearch(search.trim());
  };

  // ============================================================
  // SEARCH ON ENTER
  // ============================================================

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      setAppliedSearch(search.trim());
    }
  };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setPaymentMode("All");

    setSearch("");

    setAppliedSearch("");

    fetchReport(duration, "All", transactionType);
  };

  // ============================================================
  // FRONTEND SEARCH
  //
  // Searches returned transactions for:
  //
  // - Customer name
  // - Customer phone
  // - Invoice number
  // - Payment mode
  // - Description
  // - Transaction name
  // - Transaction phone
  // - Customer
  // - Type
  // - Amount
  // - Total
  // - Paid
  // - Unpaid
  // - MongoDB ID
  // - Item names
  // ============================================================

  const filteredTransactions = useMemo(() => {
    const query = appliedSearch.trim().toLowerCase();

    // No search
    if (!query) {
      return sales;
    }

    return sales.filter((transaction) => {
      // ------------------------------------------------------
      // Main transaction fields
      // ------------------------------------------------------

      const mainFields = [
        transaction.invoiceNumber,

        transaction.customerName,

        transaction.customerPhone,

        transaction.description,

        transaction.name,

        transaction.phone,

        transaction.customer,

        transaction.paymentMode,

        transaction.type,

        transaction.amount,

        transaction.totalAmount,

        transaction.paidAmount,

        transaction.unpaidAmount,

        transaction._id,
      ];

      // ------------------------------------------------------
      // Item names
      // ------------------------------------------------------

      const itemFields = Array.isArray(transaction.items)
        ? transaction.items.flatMap((item) => [
            item?.name,
            item?.description,
            item?.price,
            item?.quantity,
          ])
        : [];

      // ------------------------------------------------------
      // Combine everything
      // ------------------------------------------------------

      const searchableText = [...mainFields, ...itemFields]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).toLowerCase())
        .join(" ");

      return searchableText.includes(query);
    });
  }, [sales, appliedSearch]);

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

        // Reload the Sales Report
        await fetchReport();
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
  // FILTERED REPORT
  // ============================================================

  const filteredReport = useMemo(() => {
    // If there is no search,
    // use backend report directly.
    if (!appliedSearch.trim()) {
      return {
        transactions: report.transactions || 0,

        netSale: report.netSale || 0,

        paidAmount: report.paidAmount || 0,

        unpaidBalance: report.unpaidBalance || 0,
      };
    }

    // If search is applied,
    // calculate totals from visible records.
    let netSale = 0;

    let paidAmount = 0;

    let unpaidBalance = 0;

    filteredTransactions.forEach((transaction) => {
      const total = Number(transaction.totalAmount ?? transaction.amount ?? 0);

      const paid = Number(transaction.paidAmount ?? 0);

      const unpaid = Number(
        transaction.unpaidAmount ?? Math.max(total - paid, 0),
      );

      // Normal sales are positive.
      // OUT transactions are negative.
      if (String(transaction.type).toUpperCase() === "OUT") {
        netSale -= total;
      } else {
        netSale += total;
      }

      paidAmount += paid;

      unpaidBalance += unpaid;
    });

    return {
      transactions: filteredTransactions.length,

      netSale,

      paidAmount,

      unpaidBalance,
    };
  }, [filteredTransactions, report, appliedSearch]);

  // ============================================================
  // SALES GRAPH DATA
  // ============================================================

  const graphData = useMemo(() => {
    const grouped = {};

    filteredTransactions.forEach((transaction) => {
      if (!transaction.date) return;

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) return;

      const dateKey = date.toISOString().split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          label: date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          inAmount: 0,
          outAmount: 0,
          transactions: 0,
        };
      }

      const amount =
        Number(transaction.totalAmount ?? transaction.amount ?? 0) || 0;

      const type = String(transaction.type || "").toUpperCase();

      if (type === "IN") {
        grouped[dateKey].inAmount += amount;
      }

      if (type === "OUT") {
        grouped[dateKey].outAmount += amount;
      }

      grouped[dateKey].transactions += 1;
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [filteredTransactions]);

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  // ============================================================
  // DISPLAY DATE
  // ============================================================

  const displayDate = (date) => {
    if (!date) {
      return "--";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    const localDate = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
    );

    return localDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  // ============================================================
  // TRANSACTION DATE
  // ============================================================

  const formatTransactionDate = (date) => {
    if (!date) {
      return "--";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // TRANSACTION TIME
  // ============================================================

  const formatTransactionTime = (date) => {
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
  // TOTAL ITEMS
  // ============================================================

  const totalItems = useMemo(() => {
    return filteredTransactions.reduce((total, sale) => {
      return total + (Array.isArray(sale.items) ? sale.items.length : 0);
    }, 0);
  }, [filteredTransactions]);

  // ============================================================
  // GENERATE PDF
  //
  // PDF exports the CURRENTLY VISIBLE/FILTERED transactions.
  // ============================================================

  const generatePDF = () => {
    if (!filteredTransactions.length) {
      toast.error("No transactions available to export.");

      return;
    }

    try {
      setPdfLoading(true);

      const doc = new jsPDF({
        orientation: "landscape",

        unit: "mm",

        format: "a4",
      });

      // ========================================================
      // TITLE
      // ========================================================

      doc.setFontSize(20);

      doc.setFont("helvetica", "bold");

      doc.text("Sales Report", 14, 15);

      // ========================================================
      // PERIOD
      // ========================================================

      doc.setFontSize(10);

      doc.setFont("helvetica", "normal");

      doc.text(
        `Period: ${displayDate(dates.startDate)} - ${displayDate(
          dates.endDate,
        )}`,
        14,
        22,
      );

      // ========================================================
      // PAYMENT MODE
      // ========================================================

      doc.text(`Payment Mode: ${paymentMode}`, 14, 28);

      // ========================================================
      // SEARCH
      // ========================================================

      if (appliedSearch.trim()) {
        doc.text(`Search: ${appliedSearch}`, 100, 28);
      }

      // ========================================================
      // SUMMARY
      // ========================================================

      doc.setFontSize(11);

      doc.setFont("helvetica", "bold");

      doc.text(`Transactions: ${filteredReport.transactions}`, 14, 37);

      doc.text(`Net Sale: Rs. ${formatAmount(filteredReport.netSale)}`, 70, 37);

      doc.text(`Paid: Rs. ${formatAmount(filteredReport.paidAmount)}`, 135, 37);

      doc.text(
        `Unpaid: Rs. ${formatAmount(filteredReport.unpaidBalance)}`,
        190,
        37,
      );

      // ========================================================
      // TABLE DATA
      // ========================================================

      const tableData = [];

      filteredTransactions.forEach((sale, index) => {
        const itemsText =
          Array.isArray(sale.items) && sale.items.length
            ? sale.items
                .map(
                  (item) =>
                    `${item.name || "-"} x${
                      item.quantity || 1
                    } @ Rs.${formatAmount(item.price || 0)}`,
                )
                .join("\n")
            : "-";

        tableData.push([
          // #
          index + 1,

          // Invoice
          sale.invoiceNumber || "-",

          // Customer
          sale.customerName || "Walk-in Customer",

          // Phone
          sale.customerPhone || "-",

          // Date
          formatTransactionDate(sale.date),

          // Time
          formatTransactionTime(sale.date),

          // Items
          itemsText,

          // Payment
          sale.paymentMode || "-",

          // Total
          `Rs. ${formatAmount(sale.totalAmount ?? sale.amount ?? 0)}`,

          // Paid
          `Rs. ${formatAmount(sale.paidAmount || 0)}`,

          // Unpaid
          `Rs. ${formatAmount(sale.unpaidAmount || 0)}`,
        ]);
      });

      // ========================================================
      // PDF TABLE
      // ========================================================

      autoTable(doc, {
        startY: 44,

        head: [
          [
            "#",
            "Invoice",
            "Customer",
            "Phone",
            "Date",
            "Time",
            "Items",
            "Payment",
            "Total",
            "Paid",
            "Unpaid",
          ],
        ],

        body: tableData,

        theme: "grid",

        styles: {
          fontSize: 7,
          cellPadding: 2,
          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 8,
          },

          1: {
            cellWidth: 23,
          },

          2: {
            cellWidth: 28,
          },

          3: {
            cellWidth: 24,
          },

          4: {
            cellWidth: 22,
          },

          5: {
            cellWidth: 17,
          },

          6: {
            cellWidth: 65,
          },

          7: {
            cellWidth: 20,
          },

          8: {
            cellWidth: 20,
          },

          9: {
            cellWidth: 20,
          },

          10: {
            cellWidth: 20,
          },
        },
      });

      // ========================================================
      // FOOTER
      // ========================================================

      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(8);

        doc.setFont("helvetica", "normal");

        doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 8);

        doc.text(
          `Generated on ${new Date().toLocaleString("en-IN")}`,
          220,
          pageHeight - 8,
        );
      }

      // ========================================================
      // SAVE PDF
      // ========================================================

      const safeSearch = appliedSearch.trim().replace(/[^a-zA-Z0-9_-]/g, "_");

      const fileName = safeSearch
        ? `Sales_Report_${dates.startDate}_${dates.endDate}_${safeSearch}.pdf`
        : `Sales_Report_${dates.startDate}_${dates.endDate}.pdf`;

      doc.save(fileName);

      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF Error:", error);

      toast.error("Unable to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  // ============================================================
  // DURATION OPTIONS
  // ============================================================

  const durationOptions = [
    "This year",
    "This quarter",
    "This Month",
    "Last Month",
    "This week",
    "Yesterday",
    "Today",
    "Custom Date",
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        pt-16
        pb-10
        px-4
        sm:px-6
        relative
      "
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* ======================================================
          BACKGROUND
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
          max-w-7xl
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
            TITLE
        =================================================== */}

        <h1
          className="
            text-3xl
            sm:text-5xl
            font-extrabold
            text-center
            mb-8
            bg-gradient-to-r
            from-blue-600
            via-indigo-500
            to-purple-500
            bg-clip-text
            text-transparent
          "
          data-aos="zoom-in"
        >
          Sales Report
        </h1>

        {/* ==================================================
            DATE FILTERS
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
            mb-5
          "
          data-aos="fade-up"
        >
          {/* ------------------------------------------------
              DURATION
          ------------------------------------------------- */}

          <button
            type="button"
            onClick={() => setShowDuration(true)}
            className="
              bg-white/80
              dark:bg-black/60
              backdrop-blur-xl
              border
              border-white/20
              dark:border-gray-700
              rounded-xl
              px-5
              py-4
              text-left
              shadow-lg
              hover:shadow-xl
              transition
            "
          >
            <p
              className="
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              Report Duration
            </p>

            <div
              className="
                flex
                items-center
                justify-between
                mt-1
              "
            >
              <span
                className="
                  text-lg
                  font-medium
                "
              >
                {duration}
              </span>

              <span
                className="
                  text-blue-600
                  text-xl
                "
              >
                ⌄
              </span>
            </div>
          </button>

          {/* ------------------------------------------------
              START DATE
          ------------------------------------------------- */}

          <div
            className="
              bg-white/80
              dark:bg-black/60
              backdrop-blur-xl
              border
              border-white/20
              dark:border-gray-700
              rounded-xl
              px-5
              py-3
              shadow-lg
            "
          >
            <p
              className="
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              Start Date
            </p>

            <p
              className="
                text-lg
                font-medium
                mt-1
              "
            >
              {displayDate(dates.startDate)}
            </p>
          </div>

          {/* ------------------------------------------------
              END DATE
          ------------------------------------------------- */}

          <div
            className="
              bg-white/80
              dark:bg-black/60
              backdrop-blur-xl
              border
              border-white/20
              dark:border-gray-700
              rounded-xl
              px-5
              py-3
              shadow-lg
            "
          >
            <p
              className="
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              End Date
            </p>

            <p
              className="
                text-lg
                font-medium
                mt-1
              "
            >
              {displayDate(dates.endDate)}
            </p>
          </div>
        </div>

        {/* ==================================================
            SEARCH + FILTER
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
            p-4
            mb-6
          "
          data-aos="fade-up"
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              gap-3
            "
          >
            {/* ------------------------------------------------
                SEARCH INPUT
            ------------------------------------------------- */}

            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                onKeyDown={handleSearchKeyDown}
                placeholder="
                  Search invoice, customer or phone...
                "
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
                  focus:ring-sky-500
                  transition
                "
              />
            </div>

            {/* ------------------------------------------------
                PAYMENT MODE
            ------------------------------------------------- */}

            <select
              value={paymentMode}
              onChange={(e) => handlePaymentModeChange(e.target.value)}
              className="
                md:w-48
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
              "
            >
              <option value="All">All Payment</option>

              <option value="Cash">Cash</option>

              <option value="Online">Online</option>

              <option value="Credit">Credit</option>

              <option value="Partial">Partial</option>
            </select>

            {/* ------------------------------------------------
                SEARCH BUTTON
            ------------------------------------------------- */}

            <button
              type="button"
              onClick={handleSearchClick}
              className="
                px-6
                py-3
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                via-indigo-500
                to-purple-500
                text-white
                font-semibold
                shadow-lg
                hover:shadow-xl
                transition
                active:scale-95
              "
            >
              Search
            </button>

            {/* ------------------------------------------------
                RESET
            ------------------------------------------------- */}

            <button
              type="button"
              onClick={resetFilters}
              className="
                px-6
                py-3
                rounded-xl
                border
                border-gray-300
                dark:border-gray-600
                text-gray-700
                dark:text-gray-200
                font-semibold
                hover:bg-gray-100
                dark:hover:bg-gray-900
                transition
              "
            >
              Reset
            </button>
          </div>
        </motion.div>

        {/* ==================================================
            SEARCH STATUS
        =================================================== */}

        {appliedSearch.trim() && (
          <div
            className="
              mb-4
              text-sm
              text-gray-600
              dark:text-gray-300
            "
          >
            Showing results for:
            <span
              className="
                ml-1
                font-semibold
                text-blue-600
              "
            >
              "{appliedSearch}"
            </span>
          </div>
        )}

        {/* ==================================================
            SUMMARY
        =================================================== */}

        <motion.div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            bg-white/80
            dark:bg-black/60
            backdrop-blur-xl
            border
            border-white/20
            dark:border-gray-700
            rounded-2xl
            shadow-xl
            overflow-hidden
            mb-6
          "
          data-aos="fade-up"
        >
          {/* ------------------------------------------------
              TRANSACTIONS
          ------------------------------------------------- */}

          <div
            className="
              p-5
              border-r
              border-b
              lg:border-b-0
              border-gray-200
              dark:border-gray-700
            "
          >
            <p
              className="
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              TRANSACTIONS
            </p>

            <p
              className="
                text-2xl
                sm:text-3xl
                font-bold
                mt-1
              "
            >
              {filteredReport.transactions}
            </p>
          </div>

          {/* ------------------------------------------------
              NET SALE
          ------------------------------------------------- */}

          <div
            className="
              p-5
              border-b
              lg:border-b-0
              lg:border-r
              border-gray-200
              dark:border-gray-700
            "
          >
            <p
              className="
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              NET SALE ⓘ
            </p>

            <p
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-emerald-600
                mt-1
              "
            >
              ₹ {formatAmount(filteredReport.netSale)}
            </p>
          </div>

          {/* ------------------------------------------------
              PAID
          ------------------------------------------------- */}

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
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              PAID
            </p>

            <p
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-emerald-600
                mt-1
              "
            >
              ₹ {formatAmount(filteredReport.paidAmount)}
            </p>
          </div>

          {/* ------------------------------------------------
              UNPAID
          ------------------------------------------------- */}

          <div className="p-5">
            <p
              className="
                text-gray-500
                dark:text-gray-400
                text-sm
              "
            >
              UNPAID BALANCE ⓘ
            </p>

            <p
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-red-500
                mt-1
              "
            >
              ₹ {formatAmount(filteredReport.unpaidBalance)}
            </p>
          </div>
        </motion.div>
        {/* ============================================================ SALES GRAPH ============================================================ */}

        <motion.div
          className="
    bg-white/80
    dark:bg-black/60
    backdrop-blur-xl
    border
    border-white/20
    dark:border-gray-700
    rounded-2xl
    sm:rounded-3xl
    shadow-2xl
    p-5
    sm:p-6
    mb-6
  "
          data-aos="fade-up"
        >
          {/* ========================================================
      GRAPH HEADER
  ======================================================== */}

          <div
            className="
      flex
      flex-col
      sm:flex-row
      sm:items-center
      sm:justify-between
      gap-3
      mb-6
    "
          >
            <div>
              <h2
                className="
          text-xl
          sm:text-2xl
          font-bold
          text-gray-900
          dark:text-white
        "
              >
                Cash Flow Overview
              </h2>

              <p
                className="
          text-sm
          text-gray-500
          dark:text-gray-400
          mt-1
        "
              >
                Daily IN and OUT transactions for the selected period
              </p>
            </div>

            {/* ======================================================
        GRAPH SUMMARY
    ======================================================= */}

            <div
              className="
        flex
        gap-5
        text-sm
      "
            >
              {/* IN */}

              <div>
                <p
                  className="
            text-gray-500
            dark:text-gray-400
          "
                >
                  IN
                </p>

                <p
                  className="
            font-bold
            text-emerald-600
          "
                >
                  ₹
                  {formatAmount(
                    graphData.reduce((total, item) => total + item.inAmount, 0),
                  )}
                </p>
              </div>

              {/* OUT */}

              <div>
                <p
                  className="
            text-gray-500
            dark:text-gray-400
          "
                >
                  OUT
                </p>

                <p
                  className="
            font-bold
            text-red-500
          "
                >
                  ₹
                  {formatAmount(
                    graphData.reduce(
                      (total, item) => total + item.outAmount,
                      0,
                    ),
                  )}
                </p>
              </div>

              {/* TRANSACTIONS */}

              <div>
                <p
                  className="
            text-gray-500
            dark:text-gray-400
          "
                >
                  Transactions
                </p>

                <p
                  className="
            font-bold
            text-blue-600
          "
                >
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
      GRAPH
  ======================================================= */}

          {graphData.length === 0 ? (
            <div
              className="
        h-[320px]
        flex
        flex-col
        items-center
        justify-center
        text-center
      "
            >
              <div
                className="
          text-5xl
          mb-4
        "
              >
                📊
              </div>

              <p
                className="
          text-lg
          font-medium
          text-gray-700
          dark:text-gray-200
        "
              >
                No graph data available
              </p>

              <p
                className="
          text-sm
          text-gray-500
          dark:text-gray-400
          mt-1
        "
              >
                IN and OUT transactions will appear here when available.
              </p>
            </div>
          ) : (
            <div
              className="
        w-full
        h-[320px]
        sm:h-[400px]
      "
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={graphData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                  {/* X AXIS */}

                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 12,
                    }}
                    tickLine={false}
                  />

                  {/* Y AXIS */}

                  <YAxis
                    tick={{
                      fontSize: 12,
                    }}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />

                  {/* TOOLTIP */}

                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "IN") {
                        return [`₹${formatAmount(value)}`, "IN"];
                      }

                      if (name === "OUT") {
                        return [`₹${formatAmount(value)}`, "OUT"];
                      }

                      return [value, name];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(128,128,128,0.25)",
                      background: "rgba(15, 15, 30, 0.95)",
                      color: "#fff",
                    }}
                  />

                  {/* LEGEND */}

                  <Legend />

                  {/* ==================================================
              IN LINE
          ================================================== */}

                  <Line
                    type="monotone"
                    dataKey="inAmount"
                    name="IN"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                  {/* ==================================================
              OUT LINE
          ================================================== */}

                  <Line
                    type="monotone"
                    dataKey="outAmount"
                    name="OUT"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* ==================================================
            ACTION BAR
        =================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            justify-between
            items-center
            gap-3
            mb-5
          "
        >
          <div
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""} found
          </div>

          {/* ------------------------------------------------
              PDF
          ------------------------------------------------- */}

          <button
            type="button"
            onClick={generatePDF}
            disabled={pdfLoading || !filteredTransactions.length}
            className="
              w-full
              sm:w-auto
              px-6
              py-3
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              via-indigo-500
              to-purple-500
              text-white
              font-bold
              shadow-lg
              hover:shadow-xl
              transition
              active:scale-95
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {pdfLoading ? "Generating PDF..." : "📄 Generate PDF"}
          </button>
        </div>

        {/* ==================================================
            TRANSACTION LIST
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
            sm:rounded-3xl
            shadow-2xl
            overflow-hidden
          "
          data-aos="fade-up"
        >
          {/* ------------------------------------------------
              LOADING
          ------------------------------------------------- */}

          {loading ? (
            <div
              className="
                py-24
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
                  text-gray-500
                  dark:text-gray-400
                  mt-4
                "
              >
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            /* ------------------------------------------------
               EMPTY
            ------------------------------------------------- */

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
                  sm:text-2xl
                  font-medium
                "
              >
                No transactions available
              </p>

              <p
                className="
                  text-gray-500
                  dark:text-gray-400
                  mt-2
                "
              >
                Try changing the date or search filters.
              </p>
            </div>
          ) : (
            /* ------------------------------------------------
               TABLE
            ------------------------------------------------- */

            <div
              className="
                overflow-x-auto
              "
            >
              <table
                className="
                  w-full
                  min-w-[1100px]
                "
              >
                {/* ==========================================
                    HEADER
                =========================================== */}

                <thead>
                  <tr
                    className="
      border-b
      border-gray-700
      bg-gray-900/40
    "
                  >
                    <th className="px-5 py-4 text-left">#</th>

                    <th className="px-5 py-4 text-left">Invoice</th>

                    <th className="px-5 py-4 text-left">Customer</th>

                    <th className="px-5 py-4 text-left">Date</th>

                    <th className="px-5 py-4 text-left">Items</th>

                    <th className="px-5 py-4 text-left">Payment</th>

                    <th className="px-5 py-4 text-right">Total</th>

                    <th className="px-5 py-4 text-right">Paid</th>

                    {/* <th className="px-5 py-4 text-right">
      Unpaid
    </th> */}

                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>

                {/* ==========================================
                    BODY
                =========================================== */}

                <tbody>
                  {filteredTransactions.map((sale, index) => (
                    <tr
                      key={sale._id || `${index}-${sale.date}`}
                      className="
                          border-b
                          border-gray-200
                          dark:border-gray-700
                          hover:bg-gray-50
                          dark:hover:bg-gray-900
                          transition
                        "
                    >
                      {/* ----------------------------------
                            #
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                            text-gray-500
                          "
                      >
                        {index + 1}
                      </td>

                      {/* ----------------------------------
                            INVOICE
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                          "
                      >
                        <p
                          className="
                              font-semibold
                            "
                        >
                          {sale.invoiceNumber || "-"}
                        </p>
                      </td>

                      {/* ----------------------------------
                            CUSTOMER
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                          "
                      >
                        <p
                          className="
                              font-medium
                            "
                        >
                          {sale.customerName || "Walk-in Customer"}
                        </p>

                        {sale.customerPhone && (
                          <p
                            className="
                                text-xs
                                text-gray-500
                                mt-1
                              "
                          >
                            {sale.customerPhone}
                          </p>
                        )}
                      </td>

                      {/* ----------------------------------
                            DATE
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                            whitespace-nowrap
                          "
                      >
                        <p>{formatTransactionDate(sale.date)}</p>

                        <p
                          className="
                              text-xs
                              text-gray-500
                              mt-1
                            "
                        >
                          {formatTransactionTime(sale.date)}
                        </p>
                      </td>

                      {/* ----------------------------------
                            ITEMS
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                          "
                      >
                        {Array.isArray(sale.items) && sale.items.length ? (
                          <div
                            className="
                                space-y-1
                              "
                          >
                            {sale.items.slice(0, 3).map((item, itemIndex) => (
                              <p
                                key={itemIndex}
                                className="
                                        text-sm
                                      "
                              >
                                {item.name || "-"}

                                {" × "}

                                {item.quantity || 1}
                              </p>
                            ))}

                            {sale.items.length > 3 && (
                              <p
                                className="
                                    text-xs
                                    text-blue-600
                                  "
                              >
                                +{sale.items.length - 3} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span
                            className="
                                text-gray-400
                              "
                          >
                            No items
                          </span>
                        )}
                      </td>

                      {/* ----------------------------------
                            PAYMENT
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                          "
                      >
                        <span
                          className="
                              inline-block
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              bg-gray-100
                              dark:bg-gray-800
                            "
                        >
                          {sale.paymentMode || "-"}
                        </span>
                      </td>

                      {/* ----------------------------------
                            TOTAL
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                            text-right
                          "
                      >
                        <p
                          className="
                              font-bold
                              text-emerald-600
                            "
                        >
                          ₹ {formatAmount(sale.totalAmount ?? sale.amount ?? 0)}
                        </p>
                      </td>

                      {/* ----------------------------------
                            PAID
                        ----------------------------------- */}

                      <td
                        className="
                            px-5
                            py-4
                            text-right
                          "
                      >
                        <p
                          className="
                              font-semibold
                              text-emerald-600
                            "
                        >
                          ₹ {formatAmount(sale.paidAmount || 0)}
                        </p>
                      </td>

                      {/* ----------------------------------
                            UNPAID
                        ----------------------------------- */}

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(sale._id)}
                          className="
      w-9
      h-9
      rounded-lg
      inline-flex
      items-center
      justify-center
      text-red-500
      bg-red-500/10
      hover:bg-red-500
      hover:text-white
      border
      border-red-500/20
      hover:border-red-500
      transition-all
      duration-200
      active:scale-90
    "
                          title="Delete transaction"
                        >
                          <Trash2 size={17} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ========================================================
          DURATION BOTTOM SHEET
      ========================================================= */}

      {showDuration && (
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
          onClick={() => setShowDuration(false)}
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
              sm:max-w-xl
              bg-white
              dark:bg-gray-950
              rounded-t-3xl
              sm:rounded-3xl
              shadow-2xl
              p-6
            "
          >
            <h2
              className="
                text-2xl
                font-bold
                mb-5
              "
            >
              Select report duration
            </h2>

            <div
              className="
                space-y-1
              "
            >
              {durationOptions.map((option) => {
                const selected = duration === option;

                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleDurationChange(option)}
                    className="
                        w-full
                        flex
                        justify-between
                        items-center
                        px-2
                        py-4
                        text-left
                        rounded-xl
                        hover:bg-gray-100
                        dark:hover:bg-gray-900
                        transition
                      "
                  >
                    <span
                      className={
                        selected ? "text-blue-600 font-medium" : "text-gray-500"
                      }
                    >
                      {option}
                    </span>

                    <span
                      className="
                          w-8
                          h-8
                          rounded-full
                          border-2
                          border-blue-600
                          flex
                          items-center
                          justify-center
                        "
                    >
                      {selected && (
                        <span
                          className="
                              w-4
                              h-4
                              rounded-full
                              bg-blue-600
                            "
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {showCustomDate && (
        <div
          className="
      fixed
      inset-0
      z-50
      bg-black/60
      backdrop-blur-sm
      flex
      items-center
      justify-center
      px-4
    "
          onClick={() => setShowCustomDate(false)}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            onClick={(e) => e.stopPropagation()}
            className="
        w-full
        max-w-lg
        bg-white
        dark:bg-gray-950
        rounded-2xl
        shadow-2xl
        p-6
      "
          >
            {/* Header */}

            <div
              className="
          flex
          items-center
          justify-between
          mb-6
        "
            >
              <h2
                className="
            text-2xl
            font-bold
            text-gray-900
            dark:text-white
          "
              >
                Select Custom Date
              </h2>

              <button
                type="button"
                onClick={() => setShowCustomDate(false)}
                className="
            w-9
            h-9
            rounded-full
            bg-gray-100
            dark:bg-gray-800
            text-gray-600
            dark:text-gray-300
            hover:bg-gray-200
            dark:hover:bg-gray-700
            transition
          "
              >
                ✕
              </button>
            </div>

            {/* Start Date */}

            <div className="mb-5">
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
                Start Date
              </label>

              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
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
            focus:ring-blue-500
            transition
          "
              />
            </div>

            {/* End Date */}

            <div className="mb-6">
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
                End Date
              </label>

              <input
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                onChange={(e) => setCustomEndDate(e.target.value)}
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
            transition
          "
              />
            </div>

            {/* Buttons */}

            <div
              className="
          flex
          gap-3
        "
            >
              <button
                type="button"
                onClick={() => setShowCustomDate(false)}
                className="
            flex-1
            px-5
            py-3
            rounded-xl
            border
            border-gray-300
            dark:border-gray-600
            text-gray-700
            dark:text-gray-200
            font-semibold
            hover:bg-gray-100
            dark:hover:bg-gray-900
            transition
          "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCustomDateApply}
                className="
            flex-1
            px-5
            py-3
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            via-indigo-500
            to-purple-500
            text-white
            font-semibold
            shadow-lg
            hover:shadow-xl
            transition
            active:scale-95
          "
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
