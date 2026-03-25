import express from "express";
import {
  studentRegisterRules,
  studentLoginRules,
  adminLoginRules,
} from "../validators/auth.validators.js";
import { validate } from "../validators/validate.js";
import { protect } from "../middleware/auth.js";
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  getMe,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/student/register",
  studentRegisterRules,
  validate,
  registerStudent
);
router.post("/student/login", studentLoginRules, validate, loginStudent);
router.post("/admin/login", adminLoginRules, validate, loginAdmin);
router.get("/me", protect, getMe);

export default router;
