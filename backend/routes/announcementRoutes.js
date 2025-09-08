import express from "express";
import {
  addAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { announcementSchema } from "../zod/announcementValidator.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";

const announcementRoutes = express.Router();

announcementRoutes.post("/",authenticate, adminOnly, validateRequest(announcementSchema), addAnnouncement);
announcementRoutes.get("/", getAnnouncements);
announcementRoutes.get("/:id", getAnnouncementById);
announcementRoutes.put("/:id", authenticate, adminOnly, validateRequest(announcementSchema.partial()), updateAnnouncement);
announcementRoutes.delete("/:id",authenticate, adminOnly, deleteAnnouncement);

export default announcementRoutes;
