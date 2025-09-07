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

const announcementRoutes = express.Router();

announcementRoutes.post("/", validateRequest(announcementSchema), addAnnouncement);
announcementRoutes.get("/", getAnnouncements);
announcementRoutes.get("/:id", getAnnouncementById);
announcementRoutes.put("/:id", validateRequest(announcementSchema.partial()), updateAnnouncement);
announcementRoutes.delete("/:id", deleteAnnouncement);

export default announcementRoutes;
