import express from "express";
import { protectStudent } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
} from "../controllers/student.controller.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

router.get("/profile", protectStudent, wrapAsync(getProfile));
router.patch("/profile", protectStudent, wrapAsync(updateProfile));

export default router;
