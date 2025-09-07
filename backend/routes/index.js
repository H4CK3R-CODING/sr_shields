import express from "express";
import authRoutes from "./auth.js"
const mainRouter = express.Router();

mainRouter.use("/auth", authRoutes);
// mainRouter.use('/notes', );

export default mainRouter;
