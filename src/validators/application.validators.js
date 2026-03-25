import { body } from "express-validator";
import { CLEARANCE_TYPES } from "../constants/departments.js";

export const submitApplicationRules = [
  body("bankDetails.accountHolderName").trim().notEmpty(),
  body("bankDetails.accountNumber").trim().isLength({ min: 9, max: 18 }),
  body("bankDetails.ifscCode").matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i),
  body("bankDetails.bankName").trim().notEmpty(),
  body("passoutYear").isInt({ min: 2000, max: 2030 }),
  body("declaration").isBoolean(),
];

export const updateClearanceRules = [
  body("clearanceType").isIn(CLEARANCE_TYPES),
  body("status").isIn(["cleared", "hold", "pending"]),
  body("reason").optional().isString().trim(),
];
