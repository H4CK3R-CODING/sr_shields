import express from "express";
import authRoutes from "./auth.js"
import announcementRoutes from "./announcementRoutes.js";
import { contactForm } from "../controllers/contactController.js";
import countController from "../controllers/countController.js";
const mainRouter = express.Router();

mainRouter.get("/stats", countController);
mainRouter.use("/auth", authRoutes);
mainRouter.use('/announcement', announcementRoutes);
mainRouter.use("/sendMessage", contactForm);

export default mainRouter;
