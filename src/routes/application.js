import express from "express";
import {
  protectStudent,
  protectAdmin,
  restrictTo,
} from "../middleware/auth.js";
import {
  submitApplicationRules,
  updateClearanceRules,
} from "../validators/application.validators.js";
import { validate } from "../validators/validate.js";
import {
  submitApplication,
  getMyApplication,
  updateBankDetails,
  getAllApplications,
  getApplicationById,
  updateClearance,
  processRefund,
  getDashboardStats,
} from "../controllers/application.controller.js";

const router = express.Router();

router.post(
  "/submit",
  protectStudent,
  submitApplicationRules,
  validate,
  submitApplication
);
router.get("/my", protectStudent, getMyApplication);
router.patch("/bank-details", protectStudent, updateBankDetails);

router.get("/all", protectAdmin, getAllApplications);
router.get("/stats/dashboard", protectAdmin, getDashboardStats);
router.get("/:id", protectAdmin, getApplicationById);
router.patch(
  "/:id/clearance",
  protectAdmin,
  updateClearanceRules,
  validate,
  updateClearance
);
router.patch(
  "/:id/refund",
  protectAdmin,
  restrictTo("accounts", "superadmin"),
  processRefund
);

export default router;
