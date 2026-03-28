import express from "express";
import { protectAdmin, restrictTo } from "../middleware/auth.js";
import { getProfile, getAllAdmins } from "../controllers/admin.controller.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

router.get("/profile", protectAdmin, wrapAsync(getProfile));
router.get(
  "/all",
  protectAdmin,
  restrictTo("superadmin"),
  wrapAsync(getAllAdmins)
);

export default router;
