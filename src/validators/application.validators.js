import { body, param } from "express-validator";
import { CLEARANCE_TYPES } from "../constants/departments.js";

export const submitApplicationRules = [
  body("bankDetails.accountHolderName").trim().notEmpty(),
  body("bankDetails.accountNumber").trim().isLength({ min: 9, max: 18 }),
  body("bankDetails.ifscCode").matches(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  body("bankDetails.bankName").trim().notEmpty(),
  body("passoutYear").isInt({ min: 2000, max: 2030 }),
  body("declaration").isBoolean(),
];

export const updateClearanceRules = [
  body("clearanceType").isIn(CLEARANCE_TYPES),
  body("status").isIn(["cleared", "hold", "pending"]),
  body("reason").optional().isString().trim(),
];

export const submitOfflineNoDuesRules = [
  param("clearanceType").isIn(["library", "sports", "hostel", "department"]),
];

export const updateBankDetailsRules = [
  body("bankDetails.accountHolderName").optional().trim().notEmpty(),
  body("bankDetails.accountNumber")
    .optional()
    .trim()
    .isLength({ min: 9, max: 18 }),
  body("bankDetails.ifscCode")
    .optional()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  body("bankDetails.bankName").optional().trim().notEmpty(),
  body("bankDetails.branchName").optional().trim(),
];
