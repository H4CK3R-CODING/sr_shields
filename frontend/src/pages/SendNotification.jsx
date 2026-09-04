import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Smartphone,
  Users,
  Radio,
  Send,
  Trash2,
  Search,
  Check,
  X,
  Play,
  Loader2,
  MessageSquare,
  Bell,
  Briefcase,
  GraduationCap,
  FileCheck,
  Trophy,
} from "lucide-react";

const API_BASE_URL =
  (import.meta.env.VITE_BACKENDURL || "http://localhost:5000") +
  "/api/v1/notifications";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const ACTIONS = [
  {
    key: "jobs",
    title: "Latest Jobs",
    icon: <Briefcase size={28} />,
    endpoint: "/jobs",
    gradient: "from-sky-500 to-indigo-500",
  },
  {
    key: "admitCards",
    title: "Admit Cards",
    icon: <FileCheck size={28} />,
    endpoint: "/admit-cards",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    key: "results",
    title: "Results",
    icon: <Trophy size={28} />,
    endpoint: "/results",
    gradient: "from-pink-500 to-red-500",
  },
  {
    key: "admissions",
    title: "Admissions",
    icon: <GraduationCap size={28} />,
    endpoint: "/admissions",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const defaultMessage = `_*घर बैठे फॉर्म भरवाने के लिए आप 8607550898 नंबर पर डॉक्यूमेंट्स भेज कर फॉर्म भरवा सकते हैं*_

*✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ🖥️CℽBer Cᴀғᴇ🎓 KᴜʀᴜᴋꜱʜᴇᴛʀA 🧑‍🎓ᴜɴɪᴠᴇʀsɪᴛʏ🏬*`;

const SendNotification = () => {
  const [notificationCounts, setNotificationCounts] = useState(null);
  const [status, setStatus] = useState("checking");
  const [removingAuth, setRemovingAuth] = useState(false);

  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);

  const [manualChannels, setManualChannels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("manualWhatsAppChannels") || "[]");
    } catch {
      return [];
    }
  });

  const [groupSearch, setGroupSearch] = useState("");

  const [channelName, setChannelName] = useState("");
  const [channelId, setChannelId] = useState("");

  const [selectedRecipients, setSelectedRecipients] = useState([]);

  const [qr, setQr] = useState(null);

  const [message, setMessage] = useState(defaultMessage);

  const [limits, setLimits] = useState({
    jobs: 10,
    admitCards: 10,
    results: 10,
    admissions: 10,
  });

  const [loading, setLoading] = useState("");

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
    });

    loadStatus();
    loadGroups();
    loadChannels();
    loadSavedRecipients();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "manualWhatsAppChannels",
      JSON.stringify(manualChannels),
    );
  }, [manualChannels]);

  const selectedGroups = useMemo(
    () => selectedRecipients.filter((item) => item.type === "group"),
    [selectedRecipients],
  );

  const selectedChannels = useMemo(
    () => selectedRecipients.filter((item) => item.type === "channel"),
    [selectedRecipients],
  );

  const availableChannels = useMemo(
    () => uniqueRecipients([...(channels || []), ...(manualChannels || [])]),
    [channels, manualChannels],
  );

  const filteredGroups = useMemo(() => {
    const query = groupSearch.trim().toLowerCase();

    if (!query) {
      return groups;
    }

    return groups.filter(
      (group) =>
        String(group.name || "")
          .toLowerCase()
          .includes(query) ||
        String(group.id || "")
          .toLowerCase()
          .includes(query),
    );
  }, [groups, groupSearch]);

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  const loadStatus = async () => {
    try {
      const response = await api.get("/whatsapp/status");

      setStatus(response.data?.status || "disconnected");

      if (response.data?.qr) {
        setQr(response.data.qr);
      }
    } catch (error) {
      setStatus("error");
    }
  };

  /* -------------------------------------------------------
     REMOVE WHATSAPP AUTH
  ------------------------------------------------------- */

  const removeWhatsAppAuth = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove WhatsApp authentication? You will need to scan the QR code again.",
    );

    if (!confirmed) return;

    try {
      setRemovingAuth(true);

      const response = await api.post("/whatsapp/logout");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to remove WhatsApp authentication",
        );
      }

      setSelectedRecipients([]);

      try {
        await saveRecipients([]);
      } catch (error) {
        console.warn("Could not clear saved recipients:", error);
      }

      localStorage.removeItem("selectedWhatsAppGroups");

      localStorage.removeItem("selectedWhatsAppChannels");

      setQr(null);
      setStatus("disconnected");

      addLog(
        "WhatsApp",
        "success",
        "WhatsApp authentication removed successfully.",
      );

      toast.success("WhatsApp authentication removed successfully.");

      await loadStatus();
    } catch (error) {
      const errorMessage = getError(error);

      addLog("WhatsApp Logout", "error", errorMessage);

      toast.error(errorMessage);
    } finally {
      setRemovingAuth(false);
    }
  };

  /* -------------------------------------------------------
     QR
  ------------------------------------------------------- */

  const generateQR = async () => {
    setLoading("qr");

    try {
      const response = await api.get("/whatsapp/qr");

      setQr(response.data?.qr || null);

      await loadStatus();

      toast.success("WhatsApp QR generated.");
    } catch (error) {
      const errorMessage = getError(error);

      addLog("WhatsApp QR", "error", errorMessage);

      toast.error(errorMessage);
    } finally {
      setLoading("");
    }
  };

  /* -------------------------------------------------------
     GROUPS
  ------------------------------------------------------- */

  const loadGroups = async () => {
    try {
      const response = await api.get("/whatsapp/groups");

      setGroups(response.data?.groups || []);
    } catch (error) {
      addLog("Groups", "error", getError(error));
    }
  };

  /* -------------------------------------------------------
     CHANNELS
  ------------------------------------------------------- */

  const loadChannels = async () => {
    try {
      const response = await api.get("/whatsapp/channels");

      const serverChannels = response.data?.channels || [];

      setChannels(uniqueRecipients([...serverChannels, ...manualChannels]));
    } catch (error) {
      setChannels(uniqueRecipients([...manualChannels]));

      if (manualChannels.length === 0) {
        addLog("Channels", "error", getError(error));
      }
    }
  };

  /* -------------------------------------------------------
     SAVED RECIPIENTS
  ------------------------------------------------------- */

  const loadSavedRecipients = async () => {
    try {
      const response = await api.get("/whatsapp/recipients");

      const saved = response.data?.recipients || [];

      setSelectedRecipients(uniqueRecipients([...saved, ...manualChannels]));
    } catch (error) {
      addLog("Saved Recipients", "error", getError(error));
    }
  };

  /* -------------------------------------------------------
     SAVE RECIPIENTS
  ------------------------------------------------------- */

  const saveRecipients = async (recipients) => {
    try {
      await api.post("/whatsapp/recipients", {
        recipients,
      });
    } catch (error) {
      addLog("Save Recipients", "error", getError(error));
    }
  };

  /* -------------------------------------------------------
     MANUAL CHANNEL
  ------------------------------------------------------- */

  const addManualChannel = () => {
    const id = channelId.trim();

    const name = channelName.trim() || "WhatsApp Channel";

    if (!id) {
      toast.error("Please enter a Channel ID.");
      return;
    }

    if (!id.endsWith("@newsletter")) {
      toast.error("Invalid Channel ID. It must end with @newsletter.");
      return;
    }

    const channel = {
      id,
      name,
      type: "channel",
    };

    setManualChannels((previous) => uniqueRecipients([...previous, channel]));

    setChannels((previous) => uniqueRecipients([...previous, channel]));

    setSelectedRecipients((previous) => {
      const updated = uniqueRecipients([...previous, channel]);

      saveRecipients(updated);

      return updated;
    });

    setChannelId("");
    setChannelName("");

    toast.success(`${name} added successfully.`);
  };

  /* -------------------------------------------------------
     REMOVE CHANNEL
  ------------------------------------------------------- */

  const removeManualChannel = (id) => {
    setManualChannels((previous) =>
      previous.filter((channel) => channel.id !== id),
    );

    setChannels((previous) => previous.filter((channel) => channel.id !== id));

    setSelectedRecipients((previous) => {
      const updated = previous.filter((recipient) => recipient.id !== id);

      saveRecipients(updated);

      return updated;
    });

    toast.success("Manual channel removed.");
  };

  /* -------------------------------------------------------
     TOGGLE RECIPIENT
  ------------------------------------------------------- */

  const toggleRecipient = (recipient) => {
    setSelectedRecipients((previous) => {
      const exists = previous.some((item) => item.id === recipient.id);

      let updated;

      if (exists) {
        updated = previous.filter((item) => item.id !== recipient.id);
      } else {
        updated = [...previous, recipient];
      }

      saveRecipients(updated);

      return updated;
    });
  };

  /* -------------------------------------------------------
     SELECT ALL GROUPS
  ------------------------------------------------------- */

  const selectAllGroups = () => {
    const channelSelections = selectedRecipients.filter(
      (item) => item.type === "channel",
    );

    const unique = uniqueRecipients([...channelSelections, ...groups]);

    setSelectedRecipients(unique);

    saveRecipients(unique);

    toast.success(`${groups.length} groups selected.`);
  };

  /* -------------------------------------------------------
     SELECT ALL CHANNELS
  ------------------------------------------------------- */

  const selectAllChannels = () => {
    const groupSelections = selectedRecipients.filter(
      (item) => item.type === "group",
    );

    const unique = uniqueRecipients([...groupSelections, ...availableChannels]);

    setSelectedRecipients(unique);

    saveRecipients(unique);

    toast.success(`${availableChannels.length} channels selected.`);
  };

  /* -------------------------------------------------------
     CLEAR
  ------------------------------------------------------- */

  const clearRecipients = () => {
    setSelectedRecipients([]);

    saveRecipients([]);

    toast.success("Recipients cleared.");
  };

  /* -------------------------------------------------------
     SEND CUSTOM MESSAGE
  ------------------------------------------------------- */

  const sendMessage = async () => {
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one group or channel.");
      return;
    }

    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    setLoading("message");

    try {
      const response = await api.post("/whatsapp/send", {
        message: message.trim(),
        recipientIds: selectedRecipients.map((item) => item.id),
      });

      const successful =
        response.data?.results?.filter((item) => item.success)?.length || 0;

      addLog(
        "Custom Message",
        response.data?.success ? "success" : "error",
        `Delivered to ${successful}/${selectedRecipients.length} recipients.`,
        response.data,
      );

      if (response.data?.success) {
        toast.success(
          `Message delivered to ${successful}/${selectedRecipients.length} recipients.`,
        );
      } else {
        toast.error(response.data?.message || "Message sending failed.");
      }
    } catch (error) {
      const errorMessage = getError(error);

      addLog("Custom Message", "error", errorMessage);

      toast.error(errorMessage);
    } finally {
      setLoading("");
    }
  };

  /* -------------------------------------------------------
     RUN ACTION
  ------------------------------------------------------- */

  const runAction = async (action) => {
    if (selectedRecipients.length === 0) {
      toast.error("Select at least one recipient.");
      return;
    }

    setLoading(action.key);

    try {
      const response = await api.post(action.endpoint, {
        limit: Number(limits[action.key]),
      });

      addLog(
        action.title,
        response.data?.success ? "success" : "error",
        response.data?.message || "Notification process completed.",
        response.data,
      );

      if (response.data?.success) {
        toast.success(
          response.data?.message || `${action.title} notification completed.`,
        );
      } else {
        toast.error(response.data?.message || "Notification process failed.");
      }
    } catch (error) {
      const errorMessage = getError(error);

      addLog(action.title, "error", errorMessage);

      toast.error(errorMessage);
    } finally {
      setLoading("");
    }
  };

  /* -------------------------------------------------------
     RUN ALL
  ------------------------------------------------------- */

  const runAll = async () => {
    if (selectedRecipients.length === 0) {
      toast.error("Select at least one recipient.");
      return;
    }

    setLoading("all");

    try {
      const response = await api.post("/all", {
        jobs: Number(limits.jobs),
        admitCards: Number(limits.admitCards),
        results: Number(limits.results),
        admissions: Number(limits.admissions),
      });

      addLog(
        "Run All",
        response.data?.success ? "success" : "error",
        response.data?.message || "All completed.",
        response.data,
      );

      if (response.data?.success) {
        toast.success(response.data?.message || "All categories completed.");
      } else {
        toast.error(response.data?.message || "Run All failed.");
      }
    } catch (error) {
      const errorMessage = getError(error);

      addLog("Run All", "error", errorMessage);

      toast.error(errorMessage);
    } finally {
      setLoading("");
    }
  };

  /* -------------------------------------------------------
     LOG
  ------------------------------------------------------- */

  const addLog = (title, type, message, data = null) => {
    setLogs((previous) => [
      {
        id: Date.now() + Math.random(),
        title,
        type,
        message,
        data,
        time: new Date().toLocaleTimeString(),
      },
      ...previous,
    ]);
  };

  const refreshAll = async () => {
    setLoading("refresh");

    await Promise.all([
      loadStatus(),
      //   loadGroups(),
      loadChannels(),
      loadSavedRecipients(),
    ]);
    // Fetch groups in background; don't wait for it
    loadGroups();
    setLoading("");

    toast.success("Notification data refreshed.");
  };

  const loadNotificationCounts = async () => {
    setLoading("counts");

    try {
      const response = await api.get("/counts");

      if (response.data?.success) {
        setNotificationCounts(response.data.counts);
      }
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="relative min-h-screen px-3 space-y-10 sm:px-5 lg:px-6">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/30 bg-white/60 p-5 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-black/40 sm:p-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-sky-500/10 to-indigo-500/10 px-3 py-1 text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-300">
                  ADMIN PANEL
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    status === "connected"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {status === "connected"
                    ? "🟢 WhatsApp Connected"
                    : "🔴 WhatsApp Offline"}
                </span>
              </div>

              <h1 className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400 sm:text-4xl">
                Send Notification
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Manage WhatsApp groups and channels, send custom notifications,
                and control Sarkari Result notification services.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={refreshAll}
                disabled={loading === "refresh"}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-white dark:border-gray-700 dark:bg-black/30 dark:text-gray-200 dark:hover:bg-black/50"
              >
                {loading === "refresh" ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <RefreshCw size={17} />
                )}
                Refresh
              </button>

              <button
                onClick={loadNotificationCounts}
                disabled={loading === "counts"}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
              >
                {loading === "counts" ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Bell size={17} />
                )}
                Notification Counts
              </button>

              {status !== "connected" && (
                <button
                  onClick={generateQR}
                  disabled={loading === "qr"}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                >
                  {loading === "qr" ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Smartphone size={17} />
                  )}
                  Link WhatsApp
                </button>
              )}

              <button
                onClick={removeWhatsAppAuth}
                disabled={removingAuth}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
              >
                {removingAuth ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
                Remove Auth
              </button>
            </div>
          </div>
        </motion.section>

        {notificationCounts && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-sky-500/10 p-3 text-center">
              <p className="text-xs text-gray-500">Jobs</p>
              <p className="text-2xl font-bold text-sky-500">
                {notificationCounts.jobs}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-500/10 p-3 text-center">
              <p className="text-xs text-gray-500">Admit Cards</p>
              <p className="text-2xl font-bold text-indigo-500">
                {notificationCounts.admitCards}
              </p>
            </div>

            <div className="rounded-xl bg-pink-500/10 p-3 text-center">
              <p className="text-xs text-gray-500">Results</p>
              <p className="text-2xl font-bold text-pink-500">
                {notificationCounts.results}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
              <p className="text-xs text-gray-500">Admissions</p>
              <p className="text-2xl font-bold text-emerald-500">
                {notificationCounts.admissions}
              </p>
            </div>
          </div>
        )}

        {/* QR */}
        {qr && status !== "connected" && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-emerald-300/30 bg-white/60 p-6 text-center shadow-xl backdrop-blur-xl dark:border-emerald-500/20 dark:bg-black/40"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Smartphone size={25} />
            </div>

            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
              Scan WhatsApp QR
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              WhatsApp → Linked Devices → Link a Device
            </p>

            <div className="mx-auto mt-5 w-fit rounded-3xl bg-white p-4 shadow-xl">
              <img src={qr} alt="WhatsApp QR" className="h-64 w-64" />
            </div>
          </motion.section>
        )}

        {/* RECIPIENTS */}
        <motion.section
          data-aos="fade-up"
          className="w-full min-w-0 rounded-3xl border border-white/30 bg-white/60 p-4 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-black/40 sm:p-5 lg:p-7"
        >
          {/* HEADER */}
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 sm:text-xs sm:tracking-[0.25em]">
                Recipients
              </p>

              <h2 className="mt-1 flex min-w-0 items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                <Users
                  size={21}
                  className="shrink-0 text-indigo-500 sm:h-[23px] sm:w-[23px]"
                />

                <span className="truncate">Groups & Channels</span>
              </h2>

              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Select one or multiple destinations.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:flex lg:flex-wrap">
              <button
                type="button"
                onClick={selectAllGroups}
                className="w-full rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/10 dark:text-sky-400 sm:py-2 lg:w-auto"
              >
                Select All Groups
              </button>

              <button
                type="button"
                onClick={selectAllChannels}
                className="w-full rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 py-2.5 text-xs font-semibold text-purple-600 transition hover:bg-purple-500/10 dark:text-purple-400 sm:py-2 lg:w-auto"
              >
                Select All Channels
              </button>

              <button
                type="button"
                onClick={clearRecipients}
                className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400 sm:py-2 lg:w-auto"
              >
                Clear
              </button>
            </div>
          </div>

          {/* GROUPS + CHANNELS */}
          <div className="mt-5 grid w-full min-w-0 grid-cols-1 gap-6 lg:mt-6 lg:grid-cols-2">
            {/* GROUPS */}
            <div className="min-w-0">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                <h3 className="flex min-w-0 items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <Users size={18} className="shrink-0 text-sky-500" />

                  <span className="truncate">WhatsApp Groups</span>
                </h3>

                <span className="shrink-0 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 sm:px-3 sm:text-xs">
                  {selectedGroups.length} selected
                </span>
              </div>

              {/* SEARCH */}
              <div className="relative mb-3 min-w-0">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Search groups by name or ID..."
                  className="w-full min-w-0 rounded-xl border border-gray-300 bg-white/70 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              {/* GROUP COUNT */}
              <div className="mb-3 flex min-w-0 items-center justify-between gap-2 text-xs text-gray-500">
                <span className="truncate">
                  {filteredGroups.length} of {groups.length} groups
                </span>

                {groupSearch && (
                  <button
                    type="button"
                    onClick={() => setGroupSearch("")}
                    className="shrink-0 text-sky-500 hover:text-sky-600"
                  >
                    Clear search
                  </button>
                )}
              </div>

              <div className="min-w-0">
                <RecipientList
                  items={filteredGroups}
                  selected={selectedRecipients}
                  onToggle={toggleRecipient}
                />
              </div>
            </div>

            {/* CHANNELS */}
            <div className="min-w-0">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                <h3 className="flex min-w-0 items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <Radio size={18} className="shrink-0 text-purple-500" />

                  <span className="truncate">WhatsApp Channels</span>
                </h3>

                <span className="shrink-0 rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 sm:px-3 sm:text-xs">
                  {selectedChannels.length} selected
                </span>
              </div>

              {/* ADD CHANNEL */}
              <div className="mb-4 min-w-0 rounded-2xl border border-purple-300/30 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 p-3 dark:border-purple-500/20 sm:p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                  <Radio size={17} className="shrink-0" />
                  <span>Add Channel Manually</span>
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Enter the Channel JID ending with{" "}
                  <code className="break-all rounded bg-purple-500/10 px-1.5 py-0.5 text-purple-600 dark:text-purple-300">
                    @newsletter
                  </code>
                </p>

                {/* CHANNEL NAME */}
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="mt-3 w-full min-w-0 rounded-xl border border-gray-300 bg-white/70 px-3 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white"
                />

                {/* CHANNEL ID */}
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="120363XXXXXXXXXXXX@newsletter"
                  className="mt-2 w-full min-w-0 rounded-xl border border-gray-300 bg-white/70 px-3 py-3 font-mono text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white"
                />

                {/* ADD BUTTON */}
                <button
                  type="button"
                  onClick={addManualChannel}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Radio size={16} />
                  Add & Select Channel
                </button>
              </div>

              <div className="min-w-0">
                <RecipientList
                  items={availableChannels}
                  selected={selectedRecipients}
                  onToggle={toggleRecipient}
                  onRemove={removeManualChannel}
                  removableManualOnly
                />
              </div>
            </div>
          </div>

          {/* SELECTED RECIPIENTS */}
          <div className="mt-5 min-w-0 rounded-2xl border border-emerald-300/30 bg-emerald-500/5 p-3 dark:border-emerald-500/20 sm:mt-6 sm:p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <Send size={17} className="shrink-0" />

                <span className="truncate">Notifications will be sent to</span>
              </p>

              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 sm:px-3 sm:text-xs">
                {selectedRecipients.length} total
              </span>
            </div>

            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {selectedRecipients.length === 0 ? (
                <span className="text-sm text-gray-500">
                  No recipients selected.
                </span>
              ) : (
                selectedRecipients.map((recipient) => (
                  <span
                    key={recipient.id}
                    title={recipient.name}
                    className={`flex max-w-full min-w-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                      recipient.type === "group"
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-300"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-300"
                    }`}
                  >
                    <span className="shrink-0">
                      {recipient.type === "group" ? "👥" : "📢"}
                    </span>

                    <span className="min-w-0 truncate">{recipient.name}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* CUSTOM MESSAGE */}
        <motion.section
          data-aos="fade-up"
          className="rounded-3xl border border-white/30 bg-white/60 p-5 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-black/40 sm:p-7"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg">
              <MessageSquare size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Send Custom Notification
              </h2>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                This message will be sent to all selected groups and channels.
              </p>
            </div>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
            className="mt-5 w-full resize-none rounded-2xl border border-gray-300 bg-white/80 p-4 text-sm leading-relaxed text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-gray-500">
              {message.length} characters
            </span>

            <button
              onClick={sendMessage}
              disabled={loading !== "" || selectedRecipients.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading === "message" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* SARKARI RESULT */}
        <section data-aos="fade-up">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
              Sarkari Result
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Notification Controls
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Fetch and send the latest notification categories to selected
              recipients.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {ACTIONS.map((action) => (
              <motion.div
                key={action.key}
                whileHover={{ y: -3 }}
                className="rounded-3xl border border-white/30 bg-white/60 p-5 shadow-lg backdrop-blur-xl transition dark:border-gray-700 dark:bg-black/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-lg`}
                    >
                      {action.icon}
                    </div>

                    <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Maximum number of items
                    </p>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={limits[action.key]}
                    onChange={(e) =>
                      setLimits((previous) => ({
                        ...previous,
                        [action.key]: e.target.value,
                      }))
                    }
                    className="w-20 rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-center text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white"
                  />
                </div>

                <button
                  onClick={() => runAction(action)}
                  disabled={loading !== ""}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${action.gradient} px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {loading === action.key ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bell size={17} />
                      Send {action.title}
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* RUN ALL */}
          <button
            onClick={runAll}
            disabled={loading !== ""}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 px-5 py-4 font-bold text-white shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading === "all" ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Running All...
              </>
            ) : (
              <>
                <Play size={20} />
                Run All Categories
              </>
            )}
          </button>
        </section>

        {/* LOGS */}
        <section data-aos="fade-up" className="pb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
                Activity
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                Dispatch Log
              </h2>
            </div>

            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/30 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-black/20">
                <MessageSquare size={25} className="mx-auto mb-2 opacity-50" />
                No activity yet.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-white/30 bg-white/60 p-4 shadow-sm backdrop-blur-lg dark:border-gray-700 dark:bg-black/30"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {log.type === "success" ? (
                        <Check size={17} className="text-emerald-500" />
                      ) : (
                        <X size={17} className="text-red-500" />
                      )}
                    </span>

                    <strong className="text-sm text-gray-900 dark:text-white">
                      {log.title}
                    </strong>

                    <span className="text-xs text-gray-500">{log.time}</span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {log.message}
                  </p>

                  {log.data && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-medium text-indigo-500">
                        Delivery details
                      </summary>

                      <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-gray-900 p-3 text-xs text-gray-300">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

/* =========================================================
   RECIPIENT LIST
========================================================= */

function RecipientList({
  items,
  selected,
  onToggle,
  onRemove,
  removableManualOnly = false,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/20 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-black/10">
        No recipients found.
      </div>
    );
  }

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
      {items.map((item) => {
        const isSelected = selected.some(
          (recipient) => recipient.id === item.id,
        );

        return (
          <label
            key={item.id}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
              isSelected
                ? "border-sky-400/40 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 shadow-sm"
                : "border-gray-200 bg-white/40 hover:bg-white/70 dark:border-gray-700 dark:bg-black/20 dark:hover:bg-white/5"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(item)}
              className="h-4 w-4 accent-indigo-600"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                {item.type === "group" ? "👥" : "📢"} {item.name}
              </p>

              <p className="mt-1 truncate text-[10px] text-gray-500">
                {item.id}
              </p>
            </div>

            {isSelected && (
              <span className="text-emerald-500">
                <Check size={18} />
              </span>
            )}

            {removableManualOnly &&
              item.type === "channel" &&
              item.id?.endsWith("@newsletter") &&
              onRemove && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                  title="Remove manually saved channel"
                >
                  <Trash2 size={15} />
                </button>
              )}
          </label>
        );
      })}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function uniqueRecipients(recipients) {
  const map = new Map();

  recipients.forEach((recipient) => {
    map.set(recipient.id, recipient);
  });

  return Array.from(map.values());
}

function getError(error) {
  return error?.response?.data?.message || error?.message || "Request failed.";
}

export default SendNotification;
