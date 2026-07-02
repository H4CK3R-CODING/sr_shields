import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * ReciptKaro — Generate Receipt page
 * Two-column layout on desktop, stacked on mobile/tablet:
 * a live editable form and a professional, single-page PDF invoice preview.
 * Follows the app's glass-card / indigo / dark-mode theme.
 *
 * Dependencies to add to the project:
 *   npm install jspdf html2canvas
 */

const TEMPLATES = [
  { id: "blue", label: "Classic Blue", hex: "#1E3A8A" },
  { id: "green", label: "Emerald", hex: "#0F9D58" },
  { id: "red", label: "Crimson", hex: "#C62828" },
  { id: "slate", label: "Slate", hex: "#334155" },
  { id: "purple", label: "Violet", hex: "#7C3AED" },
];

const STORAGE_KEY = "receiptkaro_company_name";
const INVOICE_SEQ_KEY = "receiptkaro_invoice_seq";

const inr = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Simple Indian-numbering (Lakh/Crore) amount-in-words converter
const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigits = (n) =>
    n < 20 ? a[n] : `${b[Math.floor(n / 10)]} ${a[n % 10]}`.trim();
  const threeDigits = (n) =>
    n >= 100
      ? `${a[Math.floor(n / 100)]} Hundred ${twoDigits(n % 100)}`.trim()
      : twoDigits(n);

  const round = Math.round(num);
  if (round === 0) return "Zero Rupees Only";

  let n = round;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  const parts = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return `${parts.join(" ")} Rupees Only`.replace(/\s+/g, " ").trim();
};

// html2canvas measures and paints emoji/pictographic glyphs unreliably,
// which is what causes overlapping or garbled-looking text in the exported
// invoice. Strip them from anything that gets rendered onto the canvas.
const stripEmoji = (str = "") =>
  str
    .replace(
      /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\uFE0F]/gu,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();

const getInitials = (name) => {
  const clean = (name || "").trim();
  if (!clean) return "RK";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  let seq = Number(window.localStorage.getItem(INVOICE_SEQ_KEY) || "0") + 1;
  window.localStorage.setItem(INVOICE_SEQ_KEY, String(seq));
  return `INV-${year}-${String(seq).padStart(4, "0")}`;
};

const Receipt = () => {
  const [companyName, setCompanyName] = useState("SR's🛡️Sʜɪᴇʟᴅ");
  const [companyContact, setCompanyContact] = useState("");
  const [template, setTemplate] = useState("blue");
  const [applicantName, setApplicantName] = useState("");
  const [formServiceName, setFormServiceName] = useState("");
  const [formCharges, setFormCharges] = useState("");
  const [serviceCharges, setServiceCharges] = useState("");
  const [otherChargesDesc, setOtherChargesDesc] = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pre"); // "pre" | "post"
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const printRef = useRef(null);
  const invoiceNumber = useMemo(() => generateInvoiceNumber(), []);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
  }, []);

  // Load a display face for the invoice heading once, so the exported
  // PDF (captured via html2canvas) renders it instead of a system fallback.
  useEffect(() => {
    if (document.getElementById("receiptkaro-font-sora")) return;
    const link = document.createElement("link");
    link.id = "receiptkaro-font-sora";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  // Restore + auto-save the CSC / company name so it persists between visits
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setCompanyName(saved);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (companyName) window.localStorage.setItem(STORAGE_KEY, companyName);
    }, 400);
    return () => clearTimeout(id);
  }, [companyName]);

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setQrFile(null);
      setQrPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file for the QR code.");
      return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const accent =
    TEMPLATES.find((t) => t.id === template)?.hex ?? TEMPLATES[0].hex;

  const total =
    (Number(formCharges) || 0) +
    (Number(serviceCharges) || 0) +
    (Number(otherAmount) || 0);

  const lineItems = [
    { label: "Form Application Fee", amount: Number(formCharges) || 0 },
    {
      label: "Professional Service Charge",
      amount: Number(serviceCharges) || 0,
    },
    ...(otherChargesDesc && Number(otherAmount) > 0
      ? [{ label: otherChargesDesc, amount: Number(otherAmount) }]
      : []),
  ];

  const validateBeforeExport = () => {
    if (!applicantName || !formServiceName) {
      toast.error("⚠️ Add applicant name and form/service name first.");
      return false;
    }
    return true;
  };

  // Renders the invoice DOM node to a canvas and builds a PDF whose PAGE SIZE
  // exactly matches the rendered content (instead of dropping it onto a fixed
  // A4 sheet). That means there's no white margin/background around the card,
  // and it's still guaranteed to be a single page since the page IS the content.
  const buildInvoicePdf = async () => {
    // Make sure the injected Sora font is fully loaded before html2canvas
    // paints — otherwise it measures with one font and paints with another,
    // which is what causes overlapping/garbled text in the export.
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const node = printRef.current;
    const canvas = await html2canvas(node, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const pageWidthMM = 190; // comfortable printable width; height follows the content's ratio
    const pageHeightMM = (canvas.height / canvas.width) * pageWidthMM;

    const pdf = new jsPDF({
      orientation: pageHeightMM >= pageWidthMM ? "portrait" : "landscape",
      unit: "mm",
      format: [pageWidthMM, pageHeightMM],
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pageWidthMM,
      pageHeightMM,
      undefined,
      "FAST",
    );

    const fileName = `${invoiceNumber}-${(applicantName || "invoice").replace(/\s+/g, "_")}.pdf`;
    return { pdf, fileName };
  };

  const handleDownloadPDF = async () => {
    if (!validateBeforeExport()) return;
    setIsGenerating(true);
    const toastId = toast.loading("Generating your invoice PDF...");

    try {
      const { pdf, fileName } = await buildInvoicePdf();
      pdf.save(fileName);
      toast.success("✅ Invoice downloaded as a single-page PDF.", {
        id: toastId,
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Couldn't generate the PDF. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buildWhatsAppSummary = () => {
    const lines = [
      `*${companyName || "Receipt"}*`,
      `Invoice: ${invoiceNumber}`,
      `Applicant: ${applicantName}`,
      `Service: ${formServiceName}`,
      `Date: ${todayLabel()}`,
      "",
      ...lineItems.map((li) => `${li.label}: ₹${inr(li.amount)}`),
      "",
      `*Total Due: ₹${inr(total)}*`,
      `Status: ${paymentStatus === "pre" ? "Awaiting Payment" : "Paid"}`,
    ];
    return lines.join("\n");
  };

  // Tries to hand the actual PDF straight to the device's share sheet (where
  // WhatsApp shows up as one of the targets) — no manual download step.
  // Falls back to a text-only WhatsApp link on browsers that can't share files
  // (mainly desktop), downloading the PDF first so there's still something to attach.
  const handleShareInvoice = async () => {
    if (!validateBeforeExport()) return;
    setIsGenerating(true);
    const toastId = toast.loading("Preparing invoice to share...");

    try {
      const { pdf, fileName } = await buildInvoicePdf();
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        toast.dismiss(toastId);
        await navigator.share({
          files: [file],
          title: `Invoice ${invoiceNumber}`,
          text: `Invoice ${invoiceNumber} for ${applicantName} — Total Due ₹${inr(total)}`,
        });
      } else {
        // pdf.save(fileName);
        toast(
          "This browser can't attach files straight to WhatsApp — opening WhatsApp with the invoice details instead.",
          +{ id: toastId, icon: "💬", duration: 5000 },
        );
        const text = encodeURIComponent(buildWhatsAppSummary());
        window.open(
          `https://wa.me/?text=${text}`,
          "_blank",
          "noopener,noreferrer",
        );
      }
    } catch (err) {
      // AbortError just means the person closed the native share sheet — not a real failure
      if (err?.name !== "AbortError") {
        console.error(err);
        toast.error("❌ Couldn't share the invoice. Please try again.", {
          id: toastId,
        });
      } else {
        toast.dismiss(toastId);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const fieldClass =
    "w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-indigo-100 dark:border-indigo-800 " +
    "bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 " +
    "focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition duration-300 " +
    "shadow-sm hover:shadow-md";

  const labelClass =
    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen relative transition-colors duration-500">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Ambient background glow, matches Contact page */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-indigo-500/5 to-purple-600/10 blur-3xl opacity-60 -z-10" />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
        {/* ---------------- LEFT: FORM ---------------- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.005 }}
          data-aos="fade-right"
          className="w-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl
          shadow-lg dark:shadow-indigo-950/30 border border-indigo-100 dark:border-indigo-800
          text-gray-900 dark:text-white p-4 sm:p-6 md:p-8 h-fit transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-5 sm:mb-6 pb-4 border-b border-indigo-100 dark:border-indigo-800">
            <span className="text-lg">✏️</span>
            <h2 className="text-lg sm:text-xl font-bold">Generate Receipt</h2>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* CSC / Company Name + Template */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className={labelClass}>CSC / Company Name</label>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 whitespace-nowrap">
                    Saved Automatically
                  </span>
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Star Cyber Cafe"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Receipt Template</label>
                <div className="flex items-center flex-wrap gap-2.5 min-h-[42px]">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-label={t.label}
                      onClick={() => setTemplate(t.id)}
                      style={{ backgroundColor: t.hex }}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all shrink-0 ${
                        template === t.id
                          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-indigo-400 scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Company contact (optional, appears on the invoice letterhead) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Company Address / Phone</label>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  Optional · shown on invoice
                </span>
              </div>
              <input
                type="text"
                value={companyContact}
                onChange={(e) => setCompanyContact(e.target.value)}
                placeholder="e.g., Main Bazar Road, Dadri · +91 98xxxxxxx0"
                className={fieldClass}
              />
            </div>

            {/* Applicant / Form Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Applicant Name</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Form / Service Name</label>
                <input
                  type="text"
                  value={formServiceName}
                  onChange={(e) => setFormServiceName(e.target.value)}
                  placeholder="e.g., Passport App"
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Form Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={formCharges}
                  onChange={(e) => setFormCharges(e.target.value)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Service Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={serviceCharges}
                  onChange={(e) => setServiceCharges(e.target.value)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Other charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Other Charges Desc</label>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    Optional
                  </span>
                </div>
                <select
                  value={otherChargesDesc}
                  onChange={(e) => setOtherChargesDesc(e.target.value)}
                  className={`${fieldClass} appearance-none`}
                >
                  <option value="">-- Select --</option>
                  <option value="Printout / Photocopy">
                    Printout / Photocopy
                  </option>
                  <option value="Passport Photo">Passport Photo</option>
                  <option value="Travel / Convenience">
                    Travel / Convenience
                  </option>
                  <option value="Urgent Processing">Urgent Processing</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Other Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Payment status toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaymentStatus("pre")}
                className={`py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition duration-300 shadow-sm
                ${
                  paymentStatus === "pre"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                }`}
              >
                ⏱️ Pre-Payment
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus("post")}
                className={`py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition duration-300 shadow-sm
                ${
                  paymentStatus === "post"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                ✓ Post-Payment
              </button>
            </div>

            {/* QR upload */}
            <div className="border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5 sm:p-4 bg-indigo-50/40 dark:bg-indigo-500/5">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Upload Payment QR Code
                </label>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  Optional
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3
                file:rounded-md file:border file:border-indigo-200 dark:file:border-indigo-800
                file:bg-white dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-200 file:text-xs sm:file:text-sm
                file:font-medium hover:file:bg-indigo-50 dark:hover:file:bg-indigo-900/40 file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={isGenerating}
                onClick={handleDownloadPDF}
                className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base
                bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600
                transition duration-300 shadow-md flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating…" : "🧾 Download PDF Invoice"}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={isGenerating}
                onClick={handleShareInvoice}
                className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base
                bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400
                transition duration-300 shadow-md flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Preparing…" : "💬 Share Invoice to WhatsApp"}
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* ---------------- RIGHT: LIVE PREVIEW (single-page invoice) ---------------- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          data-aos="fade-left"
          className="w-full h-fit lg:sticky lg:top-24"
        >
          <div
            id="receipt-preview"
            ref={printRef}
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg dark:shadow-indigo-950/30
            border border-indigo-100 dark:border-indigo-800 overflow-hidden transition-all duration-300"
          >
            {/* Letterhead */}
            <div
              style={{
                backgroundImage: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
              }}
              className="relative px-5 sm:px-9 py-6 sm:py-7 text-white overflow-hidden"
            >
              {/* faint diagonal texture for depth */}
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
                }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 border border-white/25
                    flex items-center justify-center text-white font-bold text-sm sm:text-base tracking-wide
                    shrink-0 backdrop-blur-sm"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {getInitials(stripEmoji(companyName))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold tracking-tight truncate leading-snug">
                      {stripEmoji(companyName) || "Your Company Name"}
                    </p>
                    <p className="text-[10.5px] sm:text-xs text-white/75 truncate leading-snug mt-0.5">
                      {stripEmoji(companyContact) ||
                        "Form Filling & Online Services"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="text-xl sm:text-2xl font-extrabold tracking-[0.08em] leading-none"
                  >
                    INVOICE
                  </p>
                  <p className="text-[10.5px] sm:text-xs text-white/75 mt-1.5 font-medium tracking-wide">
                    {invoiceNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative p-5 sm:p-9">
              {/* subtle rotated status stamp, sits behind the content */}
              <div
                className="absolute right-6 top-24 sm:top-28 select-none pointer-events-none"
                style={{ transform: "rotate(-10deg)" }}
              >
                <div
                  className={`text-[10px] sm:text-xs font-extrabold tracking-[0.2em] uppercase
                  border-2 rounded-md px-3 py-1 opacity-[0.16] ${
                    paymentStatus === "pre"
                      ? "border-amber-600 text-amber-600"
                      : "border-emerald-600 text-emerald-600"
                  }`}
                >
                  {paymentStatus === "pre" ? "Due" : "Paid"}
                </div>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-3 gap-3 mb-6 pb-5 border-b border-gray-100">
                <div>
                  <p className="text-[9.5px] sm:text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Invoice Date
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {todayLabel()}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] sm:text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Reference No.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {invoiceNumber}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[9.5px] sm:text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase
                    tracking-wide px-2.5 py-1 rounded-full border whitespace-nowrap ${
                      paymentStatus === "pre"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        paymentStatus === "pre"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {paymentStatus === "pre" ? "Awaiting" : "Paid"}
                  </span>
                </div>
              </div>

              {/* Bill to */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  style={{
                    borderColor: `${accent}33`,
                    backgroundColor: `${accent}0A`,
                  }}
                  className="rounded-xl border px-4 py-3"
                >
                  <p
                    style={{ color: accent }}
                    className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider mb-1"
                  >
                    Billed To
                  </p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 break-words leading-snug">
                    {stripEmoji(applicantName) || "Applicant Name"}
                  </p>
                </div>
                <div
                  style={{
                    borderColor: `${accent}33`,
                    backgroundColor: `${accent}0A`,
                  }}
                  className="rounded-xl border px-4 py-3 text-right"
                >
                  <p
                    style={{ color: accent }}
                    className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider mb-1"
                  >
                    Service Availed
                  </p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 break-words leading-snug">
                    {stripEmoji(formServiceName) || "Service Name"}
                  </p>
                </div>
              </div>

              {/* Line items table */}
              <div className="mb-5 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <div
                  style={{ backgroundColor: accent }}
                  className="grid grid-cols-[1fr,auto] gap-3 px-4 py-2.5"
                >
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold text-white/90 uppercase tracking-wider">
                    Description
                  </span>
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold text-white/90 uppercase tracking-wider">
                    Amount (₹)
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {lineItems.map((li, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-[1fr,auto] gap-3 px-4 py-3 items-center ${
                        i % 2 === 1 ? "bg-gray-50/60" : "bg-white"
                      }`}
                    >
                      <span className="text-xs sm:text-sm text-gray-700">
                        {stripEmoji(li.label)}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">
                        {inr(li.amount)}
                      </span>
                    </div>
                  ))}
                  {lineItems.length === 0 && (
                    <div className="px-4 py-5 text-center text-xs text-gray-900">
                      Add charges to see them itemized here
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end mb-1.5">
                <div
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
                  }}
                  className="flex items-center justify-between gap-6 px-5 py-3 rounded-xl text-white shadow-md w-full sm:w-72"
                >
                  <span className="text-xs sm:text-sm font-bold tracking-wide">
                    Total Due
                  </span>
                  <span
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="text-base sm:text-lg font-extrabold tabular-nums"
                  >
                    ₹{inr(total)}
                  </span>
                </div>
              </div>
              <p className="text-right text-[10px] sm:text-[11px] text-gray-900 italic mb-7">
                Amount in words: {numberToWords(total)}
              </p>

              {/* QR + signature row */}
              <div className="flex items-end justify-between gap-4 mb-6">
                {qrPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={qrPreview}
                      alt="Payment QR code"
                      className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] object-contain border border-gray-200 rounded-lg p-1 bg-white"
                    />
                    <div>
                      <p className="text-[10.5px] sm:text-xs font-semibold text-gray-700">
                        Scan &amp; Pay
                      </p>
                      <p className="text-[10px] text-gray-900">
                        via any UPI app
                      </p>
                    </div>
                  </div>
                ) : (
                  <div />
                )}
                <div className="text-center">
                  <div className="h-9 border-b border-dashed border-gray-300 w-32 sm:w-40 mb-1.5" />
                  <p className="text-[10px] sm:text-[11px] text-gray-900 tracking-wide">
                    Authorized Signatory
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{ borderColor: `${accent}22` }}
                className="pt-4 border-t text-center"
              >
                <p className="text-[10px] sm:text-[11px] text-gray-900 leading-relaxed max-w-md mx-auto">
                  This is a digitally generated invoice and does not require a
                  physical signature. Please retain this document for your
                  records.
                </p>
                <p
                  style={{ color: accent }}
                  className="text-[11px] sm:text-xs font-bold mt-2 tracking-wide"
                >
                  Generated with SR's🛡️Sʜɪᴇʟᴅ
                </p>
              </div>
            </div>

            {/* thin accent edge along the bottom for a finished, printed-card feel */}
            <div style={{ backgroundColor: accent }} className="h-1.5 w-full" />
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Receipt;
