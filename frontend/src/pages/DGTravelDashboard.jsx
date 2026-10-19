import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Users,
  Wallet,
  TrendingUp,
  Clock3,
  Plus,
  Search,
  RefreshCw,
  X,
  Check,
  Plane,
  MapPin,
  IndianRupee,
  CircleCheck,
  User,
  CreditCard,
  Phone,
  Mail,
  BarChart3,
  FileDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* ───────────────────────── helpers (unchanged logic) ───────────────────────── */

const API = `${import.meta.env.VITE_BACKENDURL}/api/v1/travel`;
const token = () => localStorage.getItem("token");
const authConfig = () => ({
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
  },
});
const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const initialForm = () => ({
  bookingDate: today(),
  clientName: "",
  contactNumber: "",
  email: "",
  destination: "",
  travelDate: "",
  pax: 1,
  ratePerPax: "",
  amountCollected: "",
  paymentMode: "UPI / GPay / PhonePe",
  paymentStatus: "Partial",
  balanceDueDate: "",
  salesExecutive: "",
  notes: "",
});

const PAYMENT_MODES = [
  "UPI / GPay / PhonePe",
  "Cash",
  "Bank Transfer",
  "Card",
  "Other",
];

/* ───────────────────────── shared UI tokens ───────────────────────── */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition " +
  "placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 " +
  "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 " +
  "dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20";

const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 " +
  "text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  focusRing;

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm " +
  "font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 " +
  "dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 " +
  focusRing;

const STATUS_STYLES = {
  Paid: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  Partial: {
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  Unpaid: {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
};
const statusStyle = (s) => STATUS_STYLES[s] || STATUS_STYLES.Unpaid;

const percent = (part, whole) => {
  const w = Number(whole || 0);
  if (w <= 0) return 0;
  return Math.min(100, Math.max(0, (Number(part || 0) / w) * 100));
};

/* ───────────────────────── small components ───────────────────────── */

function StatusBadge({ status }) {
  const s = statusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function ProgressBar({ value, status, className = "" }) {
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Payment collected"
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${statusStyle(status).bar}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "indigo",
  loading,
}) {
  const tones = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  };
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20 dark:hover:border-indigo-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          {loading ? (
            <div className="mt-3 h-7 w-24 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          ) : (
            <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-white">
              {value}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-xl p-3 transition group-hover:scale-110 ${tones[tone]}`}
        >
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

/** Accessible modal shell: Esc to close, backdrop click, scroll lock, dialog semantics. */
function Modal({
  onClose,
  labelledBy,
  children,
  z = "z-[100]",
  maxWidth = "max-w-3xl",
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 ${z} flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`flex max-h-[96vh] w-full ${maxWidth} animate-[modalIn_.2s_ease-out] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 sm:rounded-2xl dark:bg-slate-950 dark:ring-white/10`}
      >
        {children}
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <fieldset className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
      <legend className="flex items-center gap-2 px-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
        <Icon size={14} /> {title}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/* ───────────────────────── booking modal ───────────────────────── */

function BookingModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searching, setSearching] = useState(false);
  const total = Math.max(
    0,
    Number(form.pax || 0) * Number(form.ratePerPax || 0),
  );
  const collected = Math.max(0, Number(form.amountCollected || 0));
  const balance = Math.max(0, total - collected);
  const overpaid = collected > total;

  useEffect(() => {
    if (customerQuery.trim().length < 2 || selectedCustomer) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const { data } = await axios.get(`${API}/customers`, {
          ...authConfig(),
          params: { search: customerQuery.trim() },
          signal: controller.signal,
        });
        setSuggestions(data.customers || []);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          console.error("Customer search:", e);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [customerQuery, selectedCustomer]);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerQuery(customer.name);
    setSuggestions([]);
    setForm((old) => ({
      ...old,
      clientName: customer.name || "",
      contactNumber: customer.phone || "",
      email: customer.email || "",
      salesExecutive: old.salesExecutive,
    }));
  };
  const handleNameChange = (value) => {
    setSelectedCustomer(null);
    setCustomerQuery(value);
    update("clientName", value);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.clientName.trim()) return toast.error("Enter the client name.");
    if (!form.destination.trim())
      return toast.error("Enter the tour destination.");
    if (!form.travelDate) return toast.error("Select the travel date.");
    if (Number(form.pax) < 1 || Number(form.ratePerPax) < 0)
      return toast.error("Enter valid guest and rate values.");
    if (collected > total)
      return toast.error("Amount collected cannot exceed the booking total.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        customerId: selectedCustomer?._id || undefined,
        pax: Number(form.pax),
        ratePerPax: Number(form.ratePerPax),
        totalAmount: total,
        amountCollected: collected,
        balanceDue: balance,
      };
      const { data } = await axios.post(
        `${API}/bookings`,
        payload,
        authConfig(),
      );
      toast.success(data.message || "Booking created successfully.");
      onCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create booking.");
    } finally {
      setSaving(false);
    }
  };

  // Plain render helper (NOT a component) so inputs keep focus while typing.
  const field = (label, key, options = {}) => (
    <label className={`block ${options.className || ""}`}>
      <span className={labelClass}>
        {label}
        {options.required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {options.options ? (
        <select
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          className={inputClass}
        >
          {options.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          required={options.required}
          type={options.type || "text"}
          min={options.min}
          inputMode={options.type === "number" ? "decimal" : undefined}
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          placeholder={options.placeholder || ""}
          className={inputClass}
        />
      )}
    </label>
  );

  const collectedPct = percent(collected, total);

  return (
    <Modal onClose={onClose} labelledBy="booking-modal-title">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Plane size={20} />
          </span>
          <div>
            <h2
              id="booking-modal-title"
              className="text-lg font-extrabold text-slate-900 dark:text-white"
            >
              Add New Client Booking
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Register the package and initial payment
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`}
        >
          <X size={19} />
        </button>
      </header>

      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
          <FormSection icon={User} title="Client">
            {field("Booking date", "bookingDate", {
              type: "date",
              required: true,
            })}
            <div className="block">
              <label htmlFor="client-name" className={labelClass}>
                Member / Client name
                <span className="ml-0.5 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="relative">
                <input
                  id="client-name"
                  required
                  autoFocus
                  value={form.clientName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className={inputClass}
                  autoComplete="off"
                />
                {searching && (
                  <RefreshCw
                    size={14}
                    className="absolute right-3 top-3.5 animate-spin text-slate-400"
                    aria-label="Searching"
                  />
                )}
                {suggestions.length > 0 && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    {suggestions.map((c) => (
                      <button
                        type="button"
                        role="option"
                        key={c._id}
                        onClick={() => selectCustomer(c)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                          {(c.name || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {c.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {c.phone || "No phone"}
                            {c.email ? ` · ${c.email}` : ""}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedCustomer && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CircleCheck size={12} /> Existing client — details
                  auto-filled
                </span>
              )}
              {form.clientName.trim().length >= 2 &&
                !selectedCustomer &&
                suggestions.length === 0 &&
                !searching && (
                  <span className="mt-1.5 block text-[11px] text-slate-500 dark:text-slate-400">
                    New client — details will be saved for future suggestions.
                  </span>
                )}
            </div>
            {field("Contact number", "contactNumber", {
              placeholder: "+91 98765 43210",
              type: "tel",
            })}
            {field("Email (optional)", "email", {
              type: "email",
              placeholder: "client@example.com",
            })}
          </FormSection>

          <FormSection icon={MapPin} title="Trip">
            {field("Tour destination", "destination", {
              placeholder: "Kashmir Valley",
              required: true,
            })}
            {field("Travel date", "travelDate", {
              type: "date",
              required: true,
            })}
            {field("PAX (guests)", "pax", {
              type: "number",
              min: "1",
              required: true,
            })}
            {field("Rate per pax (INR)", "ratePerPax", {
              type: "number",
              min: "0",
              required: true,
              placeholder: "0",
            })}
          </FormSection>

          <FormSection icon={CreditCard} title="Payment">
            <div>
              {field("Amount collected (INR)", "amountCollected", {
                type: "number",
                min: "0",
                required: true,
                placeholder: "0",
              })}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  ["25%", 0.25],
                  ["50%", 0.5],
                  ["Full", 1],
                ].map(([label, ratio]) => (
                  <button
                    type="button"
                    key={label}
                    disabled={total <= 0}
                    onClick={() =>
                      update(
                        "amountCollected",
                        String(Math.round(total * ratio * 100) / 100),
                      )
                    }
                    className={`rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950/50 ${focusRing}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {field("Payment mode", "paymentMode", { options: PAYMENT_MODES })}
            {field("Payment status", "paymentStatus", {
              options: ["Unpaid", "Partial", "Paid"],
            })}
            {field("Balance due date", "balanceDueDate", { type: "date" })}
            {field("Sales executive", "salesExecutive", {
              placeholder: "Executive name",
            })}
            <label className="block sm:col-span-2">
              <span className={labelClass}>Notes (optional)</span>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
                placeholder="Special requests or booking notes"
                className={`${inputClass} resize-none`}
              />
            </label>
          </FormSection>
        </div>

        {/* Sticky summary + actions */}
        <footer className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Booking total
              </p>
              <p className="mt-0.5 text-sm font-extrabold tabular-nums text-slate-900 sm:text-base dark:text-white">
                {money(total)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Collected
              </p>
              <p
                className={`mt-0.5 text-sm font-extrabold tabular-nums sm:text-base ${overpaid ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"}`}
              >
                {money(collected)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Balance due
              </p>
              <p className="mt-0.5 text-sm font-extrabold tabular-nums text-amber-700 sm:text-base dark:text-amber-400">
                {money(balance)}
              </p>
            </div>
          </div>
          <ProgressBar
            value={collectedPct}
            status={
              collectedPct >= 100
                ? "Paid"
                : collectedPct > 0
                  ? "Partial"
                  : "Unpaid"
            }
            className="mt-3"
          />
          {overpaid && (
            <p
              role="alert"
              className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400"
            >
              Amount collected is more than the booking total.
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`${btnPrimary} px-5`}
            >
              {saving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? "Saving…" : "Register Booking"}
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}

/* ───────────────────────── dashboard ───────────────────────── */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 font-bold text-slate-800 dark:text-slate-100">
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-bold tabular-nums">{money(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div
      className="divide-y divide-slate-100 dark:divide-slate-800"
      aria-busy="true"
      aria-label="Loading bookings"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-5">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function AddPaymentButton({ booking, onClick }) {
  return Number(booking.balanceDue) > 0 ? (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 active:scale-95 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10 ${focusRing}`}
    >
      <Wallet size={13} /> Add payment
    </button>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <CircleCheck size={13} /> Settled
    </span>
  );
}

export default function DGTravelDashboard() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [period, setPeriod] = useState("year");
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI / GPay / PhonePe");
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/dashboard`, authConfig());
      setSummary(data.summary);
      setBookings(data.bookings || []);
      setChart(data.monthly || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load travel dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((b) => {
        const term = search.toLowerCase();
        const matchSearch =
          !term ||
          [
            b.bookingId,
            b.clientName,
            b.contactNumber,
            b.destination,
            b.salesExecutive,
          ].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(term),
          );
        return matchSearch && (status === "All" || b.paymentStatus === status);
      }),
    [bookings, search, status],
  );

  const statusCounts = useMemo(() => {
    const counts = { All: bookings.length, Paid: 0, Partial: 0, Unpaid: 0 };
    bookings.forEach((b) => {
      if (counts[b.paymentStatus] !== undefined) counts[b.paymentStatus] += 1;
    });
    return counts;
  }, [bookings]);

  const chartData = useMemo(
    () =>
      chart.filter(
        (m) =>
          period === "year" ||
          (Number(m.month) >= (Number(period[1]) - 1) * 3 + 1 &&
            Number(m.month) <= Number(period[1]) * 3),
      ),
    [chart, period],
  );

  /** Exports the CURRENTLY VISIBLE (searched / filtered) bookings. */
  const generatePDF = () => {
    if (!filteredBookings.length) {
      toast.error("No bookings available to export.");
      return;
    }
    try {
      setPdfLoading(true);
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pdfMoney = (v) =>
        `Rs. ${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

      const totals = filteredBookings.reduce(
        (acc, b) => ({
          gross: acc.gross + Number(b.totalAmount || 0),
          collected: acc.collected + Number(b.amountCollected || 0),
          balance: acc.balance + Number(b.balanceDue || 0),
          pax: acc.pax + Number(b.pax || 0),
        }),
        { gross: 0, collected: 0, balance: 0, pax: 0 },
      );
      const rate =
        totals.gross > 0 ? (totals.collected / totals.gross) * 100 : 0;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("DG TRAVEL PVT LTD", 14, 15);
      doc.setFontSize(12);
      doc.text("Booking & Payment Report", 14, 22);

      // Filters
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Payment Status: ${status}`, 14, 28);
      if (search.trim()) doc.text(`Search: ${search.trim()}`, 80, 28);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 283, 15, {
        align: "right",
      });

      // Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Bookings: ${filteredBookings.length}`, 14, 36);
      doc.text(`Gross: ${pdfMoney(totals.gross)}`, 60, 36);
      doc.text(`Collected: ${pdfMoney(totals.collected)}`, 120, 36);
      doc.text(`Outstanding: ${pdfMoney(totals.balance)}`, 185, 36);
      doc.text(`Collection Rate: ${rate.toFixed(1)}%`, 245, 36);

      autoTable(doc, {
        startY: 42,
        head: [
          [
            "#",
            "Booking ID",
            "Client",
            "Contact",
            "Destination",
            "Travel Date",
            "PAX",
            "Gross",
            "Collected",
            "Balance",
            "Status",
          ],
        ],
        body: filteredBookings.map((b, i) => [
          i + 1,
          b.bookingId || "-",
          b.clientName || "-",
          b.contactNumber || "-",
          b.destination || "-",
          dateLabel(b.travelDate),
          b.pax ?? "-",
          pdfMoney(b.totalAmount),
          pdfMoney(b.amountCollected),
          pdfMoney(b.balanceDue),
          b.paymentStatus || "-",
        ]),
        foot: [
          [
            "",
            "",
            "",
            "",
            "",
            "Total",
            totals.pax,
            pdfMoney(totals.gross),
            pdfMoney(totals.collected),
            pdfMoney(totals.balance),
            "",
          ],
        ],
        showFoot: "lastPage",
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, valign: "middle" },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: 30,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 26 },
          2: { cellWidth: 36 },
          3: { cellWidth: 28 },
          4: { cellWidth: 34 },
          5: { cellWidth: 24 },
          6: { cellWidth: 12, halign: "right" },
          7: { cellWidth: 27, halign: "right" },
          8: { cellWidth: 27, halign: "right" },
          9: { cellWidth: 27, halign: "right" },
          10: { cellWidth: 20, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 10) {
            const colors = {
              Paid: [5, 150, 105],
              Partial: [217, 119, 6],
              Unpaid: [220, 38, 38],
            };
            const c = colors[data.cell.raw];
            if (c) {
              data.cell.styles.textColor = c;
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      // Footer on every page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const h = doc.internal.pageSize.height;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 14, h - 8);
        doc.text("DG TRAVEL PVT LTD · Confidential", 283, h - 8, {
          align: "right",
        });
      }

      const safeSearch = search.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const parts = [
        "Booking_Report",
        status !== "All" ? status : null,
        safeSearch || null,
        today(),
      ].filter(Boolean);
      doc.save(`${parts.join("_")}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Unable to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const closePayment = useCallback(() => setPaymentBooking(null), []);
  const closeBooking = useCallback(() => setShowModal(false), []);

  const submitPayment = async (event) => {
    event.preventDefault();
    if (!paymentBooking || Number(paymentAmount) <= 0)
      return toast.error("Enter a valid payment amount.");
    setPaymentSaving(true);
    try {
      const { data } = await axios.post(
        `${API}/bookings/${paymentBooking._id}/payments`,
        { amount: Number(paymentAmount), paymentMode },
        authConfig(),
      );
      toast.success(data.message || "Payment recorded.");
      setPaymentBooking(null);
      setPaymentAmount("");
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to record payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const openPayment = (b) => {
    setPaymentBooking(b);
    setPaymentAmount(String(b.balanceDue));
  };
  const remainingAfter = paymentBooking
    ? Math.max(
        0,
        Number(paymentBooking.balanceDue || 0) - Number(paymentAmount || 0),
      )
    : 0;

  return (
    <div className="relative mx-auto max-w-[1500px] space-y-6 pb-8 before:pointer-events-none before:absolute before:-top-10 before:left-1/4 before:-z-10 before:h-72 before:w-72 before:rounded-full before:bg-indigo-400/10 before:blur-3xl dark:before:bg-indigo-500/10 pt-6 sm:pt-10 lg:pt-12">
      {/* ── Header ── */}
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-300/20 backdrop-blur sm:p-7 dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-black/30">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Executive CRM
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live Sync
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              DG TRAVEL PVT LTD
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sales & Member Payment Management System
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Executive Sales & Payment Ledger · Financial overview and booking
              operations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className={btnSecondary}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
            <button onClick={() => setShowModal(true)} className={btnPrimary}>
              <Plus size={17} /> New Booking
            </button>
          </div>
        </div>
      </section>

      {/* ── KPIs ── */}
      <section aria-labelledby="snapshot-title">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-600" />
          <h2
            id="snapshot-title"
            className="text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300"
          >
            Executive Financial Snapshot
          </h2>
          <span className="ml-auto hidden text-[11px] text-slate-500 sm:block dark:text-slate-400">
            Auto-computed from active records
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            loading={loading && !summary}
            label="Total Bookings"
            value={summary?.totalBookings ?? "—"}
            hint="Registered tours"
            icon={Users}
            tone="indigo"
          />
          <StatCard
            loading={loading && !summary}
            label="Gross Sales"
            value={money(summary?.grossSales)}
            hint="Total booking value"
            icon={IndianRupee}
            tone="blue"
          />
          <StatCard
            loading={loading && !summary}
            label="Collected"
            value={money(summary?.collected)}
            hint="Payments received"
            icon={CircleCheck}
            tone="emerald"
          />
          <StatCard
            loading={loading && !summary}
            label="Outstanding"
            value={money(summary?.outstanding)}
            hint="Pending dues"
            icon={Clock3}
            tone="amber"
          />
          <StatCard
            loading={loading && !summary}
            label="Collection Rate"
            value={`${Number(summary?.collectionRate || 0).toFixed(1)}%`}
            hint="Collected vs billed"
            icon={TrendingUp}
            tone="violet"
          />
        </div>
      </section>

      {/* ── Chart ── */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Monthly Sales & Collection Performance ({new Date().getFullYear()}
              )
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Calendar-month breakdown of gross sales and receipts.
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Chart period"
            className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          >
            {["year", "q1", "q2", "q3", "q4"].map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${focusRing} ${
                  period === p
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {p === "year" ? "Full Year" : p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          {loading && chart.length === 0 ? (
            <div className="h-full w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ) : chartData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <BarChart3 size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No data for this period
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try another quarter or add a booking.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 100000
                      ? `₹${(v / 100000).toFixed(1)}L`
                      : v >= 1000
                        ? `₹${Math.round(v / 1000)}k`
                        : `₹${v}`
                  }
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="grossSales"
                  name="Gross Sales (INR)"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="collected"
                  name="Amount Collected (INR)"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Ledger ── */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Booking & Payment Ledger
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Search clients and track payment balances.
              </p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />
              <input
                type="search"
                aria-label="Search bookings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, destination…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by payment status"
            >
              {["All", "Paid", "Partial", "Unpaid"].map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${focusRing} ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500"
                    }`}
                  >
                    {s !== "All" && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : STATUS_STYLES[s].dot}`}
                      />
                    )}
                    {s}
                    <span
                      className={`rounded-full px-1.5 text-[10px] tabular-nums ${active ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}
                    >
                      {statusCounts[s]}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={generatePDF}
              disabled={pdfLoading || filteredBookings.length === 0}
              className={btnPrimary}
            >
              {pdfLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <FileDown size={16} />
              )}
              {pdfLoading ? "Generating PDF…" : "Generate PDF"}
            </button>
          </div>
        </div>

        {loading && bookings.length === 0 ? (
          <SkeletonRows />
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 w-fit rounded-2xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <CalendarDays size={24} />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              No bookings found
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {search || status !== "All"
                ? "Try clearing your search or filter."
                : "Create a booking to get started."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {(search || status !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatus("All");
                  }}
                  className={btnSecondary}
                >
                  Clear filters
                </button>
              )}
              <button onClick={() => setShowModal(true)} className={btnPrimary}>
                <Plus size={16} /> New Booking
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
              {filteredBookings.map((b) => {
                const pct = percent(b.amountCollected, b.totalAmount);
                return (
                  <li key={b._id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800 dark:text-slate-100">
                          {b.clientName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {b.bookingId} · {b.contactNumber || "No contact"}
                        </p>
                      </div>
                      <StatusBadge status={b.paymentStatus} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-indigo-500" />
                        {b.destination}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-slate-400" />
                        {dateLabel(b.travelDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={13} className="text-slate-400" />
                        {b.pax} pax
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                          Gross
                        </p>
                        <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {money(b.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                          Collected
                        </p>
                        <p className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                          {money(b.amountCollected)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                          Balance
                        </p>
                        <p className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
                          {money(b.balanceDue)}
                        </p>
                      </div>
                    </div>
                    <ProgressBar value={pct} status={b.paymentStatus} />
                    <div className="flex justify-end">
                      <AddPaymentButton
                        booking={b}
                        onClick={() => openPayment(b)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop table */}
            <div className="hidden max-h-[640px] overflow-auto md:block">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 backdrop-blur dark:bg-slate-950/95 dark:text-slate-400">
                  <tr>
                    {[
                      "Booking / Client",
                      "Destination",
                      "Travel Date",
                      "PAX",
                      "Gross Amount",
                      "Collected",
                      "Balance",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className={`px-4 py-3.5 ${["PAX", "Gross Amount", "Collected", "Balance"].includes(h) ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBookings.map((b) => {
                    const pct = percent(b.amountCollected, b.totalAmount);
                    return (
                      <tr
                        key={b._id}
                        className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/25"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                              {(b.clientName || "?").charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-800 dark:text-slate-100">
                                {b.clientName}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                {b.bookingId} ·{" "}
                                {b.contactNumber || "No contact"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                            <MapPin size={13} className="text-indigo-500" />
                            {b.destination}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                          {dateLabel(b.travelDate)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {b.pax}
                        </td>
                        <td className="px-4 py-4 text-right font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {money(b.totalAmount)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {money(b.amountCollected)}
                          </p>
                          <ProgressBar
                            value={pct}
                            status={b.paymentStatus}
                            className="ml-auto mt-1.5 w-20"
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-bold tabular-nums text-amber-700 dark:text-amber-400">
                          {money(b.balanceDue)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={b.paymentStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <AddPaymentButton
                            booking={b}
                            onClick={() => openPayment(b)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span aria-live="polite">
            Showing {filteredBookings.length} of {bookings.length} booking(s)
          </span>
          <span className="hidden sm:inline">
            Totals are calculated by the backend
          </span>
        </div>
      </section>

      {showModal && (
        <BookingModal onClose={closeBooking} onCreated={fetchDashboard} />
      )}

      {/* ── Record payment ── */}
      {paymentBooking && (
        <Modal
          onClose={closePayment}
          labelledBy="payment-modal-title"
          z="z-[110]"
          maxWidth="max-w-md"
        >
          <form onSubmit={submitPayment} className="p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="payment-modal-title"
                  className="text-lg font-extrabold text-slate-900 dark:text-white"
                >
                  Record Payment
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {paymentBooking.clientName} · {paymentBooking.bookingId}
                </p>
              </div>
              <button
                type="button"
                onClick={closePayment}
                aria-label="Close"
                className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  Current balance
                </p>
                <p className="mt-0.5 font-extrabold tabular-nums text-amber-700 dark:text-amber-400">
                  {money(paymentBooking.balanceDue)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  After this payment
                </p>
                <p
                  className={`mt-0.5 font-extrabold tabular-nums ${remainingAfter === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}
                >
                  {money(remainingAfter)}
                </p>
              </div>
            </div>

            <label className="mb-2 block">
              <span className={labelClass}>Payment amount (INR)</span>
              <input
                required
                autoFocus
                type="number"
                min="1"
                max={paymentBooking.balanceDue}
                step="0.01"
                inputMode="decimal"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {[
                ["50%", 0.5],
                ["Full balance", 1],
              ].map(([label, ratio]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() =>
                    setPaymentAmount(
                      String(
                        Math.round(
                          Number(paymentBooking.balanceDue) * ratio * 100,
                        ) / 100,
                      ),
                    )
                  }
                  className={`rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950/50 ${focusRing}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="mb-6 block">
              <span className={labelClass}>Payment mode</span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className={inputClass}
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePayment}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paymentSaving}
                className={btnPrimary}
              >
                {paymentSaving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {paymentSaving ? "Saving…" : "Save payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
