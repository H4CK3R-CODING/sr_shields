import express from "express";

import {
    getWhatsAppQR,
    logoutWhatsApp,
    getWhatsAppGroups,
    getWhatsAppChannels,
    getRecipients,
    saveRecipients,
    sendMessage,
    runJobs,
    runAdmitCards,
    runResults,
    runAdmissions,
    runAll
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { whatsappStatus } from "../controllers/notificationController.js";
import { notificationCounts } from "../controllers/notificationController.js";

const router = express.Router();

router.use(authenticate);
router.use(adminOnly);

router.get("/whatsapp/status", whatsappStatus);

router.get("/whatsapp/qr", getWhatsAppQR);

router.post("/whatsapp/logout", logoutWhatsApp);

router.get("/whatsapp/groups", getWhatsAppGroups);

router.get("/whatsapp/channels", getWhatsAppChannels);

router.get("/whatsapp/recipients", getRecipients);

router.get("/counts", notificationCounts);

router.post("/whatsapp/recipients", saveRecipients);

router.post("/whatsapp/send", sendMessage);

router.post("/jobs", runJobs);

router.post("/admit-cards", runAdmitCards);

router.post("/results", runResults);

router.post("/admissions", runAdmissions);

router.post("/all", runAll);

export default router;