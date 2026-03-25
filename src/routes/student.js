import express from "express";
import { protectStudent } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/profile", protectStudent, getProfile);
router.patch("/profile", protectStudent, updateProfile);

export default router;
