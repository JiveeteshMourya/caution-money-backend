import { body } from "express-validator";

export const studentRegisterRules = [
  body("enrollmentNumber").trim().notEmpty().isLength({ min: 8, max: 14 }),
  body("name").trim().notEmpty().isLength({ min: 2, max: 100 }),
  body("mobileNumber").matches(/^[6-9]\d{9}$/),
  body("department").notEmpty(),
  body("dateOfBirth").isDate(),
  body("password").isLength({ min: 8 }),
  body("isHosteller").isBoolean(),
];

export const studentLoginRules = [
  body("enrollmentNumber").trim().notEmpty(),
  body("password").notEmpty(),
];

export const adminLoginRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];
