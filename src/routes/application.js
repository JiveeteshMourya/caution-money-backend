import express from "express";
import {
  protectStudent,
  protectAdmin,
  restrictTo,
} from "../middleware/auth.js";
import {
  submitApplicationRules,
  updateClearanceRules,
  updateBankDetailsRules,
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
  submitOfflineNoDues,
  uploadDocuments,
} from "../controllers/application.controller.js";
import wrapAsync from "../utils/wrapAsync.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

router.post(
  "/submit",
  protectStudent,
  submitApplicationRules,
  validate,
  wrapAsync(submitApplication)
);
router.get("/my", protectStudent, wrapAsync(getMyApplication));
router.patch(
  "/bank-details",
  protectStudent,
  updateBankDetailsRules,
  validate,
  wrapAsync(updateBankDetails)
);

router.patch(
  "/my/offline-noDues",
  protectStudent,
  upload.single("noDuesImage"),
  wrapAsync(submitOfflineNoDues)
);

router.patch(
  "/my/documents",
  protectStudent,
  upload.fields([
    { name: "tcOrAdmissionSlip", maxCount: 1 },
    { name: "bankPassbook", maxCount: 1 },
    { name: "feesSlip", maxCount: 1 },
  ]),
  wrapAsync(uploadDocuments)
);

router.get("/all", protectAdmin, wrapAsync(getAllApplications));
router.get("/stats/dashboard", protectAdmin, wrapAsync(getDashboardStats));
router.get("/:id", protectAdmin, wrapAsync(getApplicationById));
router.patch(
  "/:id/clearance",
  protectAdmin,
  updateClearanceRules,
  validate,
  wrapAsync(updateClearance)
);
router.patch(
  "/:id/refund",
  protectAdmin,
  restrictTo("accounts", "superadmin"),
  wrapAsync(processRefund)
);

export default router;
