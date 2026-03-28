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
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

router.post(
  "/student/register",
  studentRegisterRules,
  validate,
  wrapAsync(registerStudent)
);
router.post(
  "/student/login",
  studentLoginRules,
  validate,
  wrapAsync(loginStudent)
);
router.post("/admin/login", adminLoginRules, validate, wrapAsync(loginAdmin));
router.get("/me", protect, wrapAsync(getMe));

export default router;
