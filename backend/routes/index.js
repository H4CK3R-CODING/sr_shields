import express from "express";
import authRoutes from "./auth.js"
import announcementRoutes from "./announcementRoutes.js";
import { contactForm } from "../controllers/contactController.js";
import countController from "../controllers/countController.js";
import cashbookRoutes from "./cashbookRoutes.js";
import salesReportRoutes from "./salesReportRoutes.js";
import notificationRoutes from "./notificationRoutes.js";


const mainRouter = express.Router();

mainRouter.get("/stats", countController);
mainRouter.use("/auth", authRoutes);
mainRouter.use('/announcement', announcementRoutes);
mainRouter.use("/cashbook", cashbookRoutes);

mainRouter.use(
  "/sales-report",
  salesReportRoutes
);
mainRouter.use("/sendMessage", contactForm);

mainRouter.use("/notifications", notificationRoutes);


export default mainRouter;
