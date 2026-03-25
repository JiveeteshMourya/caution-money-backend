import express from "express";
import { protectAdmin, restrictTo } from "../middleware/auth.js";
import { getProfile, getAllAdmins } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/profile", protectAdmin, getProfile);
router.get("/all", protectAdmin, restrictTo("superadmin"), getAllAdmins);

export default router;
