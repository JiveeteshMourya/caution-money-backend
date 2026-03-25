import express from "express";
import { body, validationResult } from "express-validator";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import { signToken, protect } from "../middleware/auth.js";

const router = express.Router();

// ── Student Register ──────────────────────────────────────────────
router.post(
  "/student/register",
  [
    body("enrollmentNumber").trim().notEmpty().isLength({ min: 8, max: 14 }),
    body("name").trim().notEmpty().isLength({ min: 2, max: 100 }),
    body("mobileNumber").matches(/^[6-9]\d{9}$/),
    body("department").notEmpty(),
    body("dateOfBirth").isDate(),
    body("password").isLength({ min: 8 }),
    body("isHosteller").isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const {
        enrollmentNumber,
        name,
        mobileNumber,
        department,
        dateOfBirth,
        password,
        isHosteller,
        passoutYear,
      } = req.body;

      const exists = await Student.findOne({
        enrollmentNumber: enrollmentNumber.toUpperCase(),
      });
      if (exists)
        return res
          .status(409)
          .json({ error: "Enrollment number already registered" });

      const student = await Student.create({
        enrollmentNumber: enrollmentNumber.toUpperCase(),
        name,
        mobileNumber,
        department,
        dateOfBirth,
        password,
        isHosteller: isHosteller || false,
        passoutYear,
      });

      const token = signToken(student._id, "student");
      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: student._id,
          enrollmentNumber: student.enrollmentNumber,
          name: student.name,
          department: student.department,
          isHosteller: student.isHosteller,
          role: "student",
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── Student Login ─────────────────────────────────────────────────
router.post(
  "/student/login",
  [body("enrollmentNumber").trim().notEmpty(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { enrollmentNumber, password } = req.body;
      const student = await Student.findOne({
        enrollmentNumber: enrollmentNumber.toUpperCase(),
      }).select("+password");

      if (!student)
        return res.status(401).json({ error: "Invalid credentials" });
      if (student.isLocked())
        return res
          .status(423)
          .json({
            error:
              "Account locked due to too many failed attempts. Try again in 2 hours.",
          });

      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        await student.incLoginAttempts();
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Reset login attempts on success
      await Student.findByIdAndUpdate(student._id, {
        $set: { loginAttempts: 0, lastLogin: new Date() },
        $unset: { lockUntil: 1 },
      });

      const token = signToken(student._id, "student");
      res.json({
        message: "Login successful",
        token,
        user: {
          id: student._id,
          enrollmentNumber: student.enrollmentNumber,
          name: student.name,
          department: student.department,
          isHosteller: student.isHosteller,
          mobileNumber: student.mobileNumber,
          role: "student",
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── Admin Login ───────────────────────────────────────────────────
router.post(
  "/admin/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email }).select("+password");

      if (!admin || !admin.isActive)
        return res
          .status(401)
          .json({ error: "Invalid credentials or account inactive" });
      if (admin.isLocked && admin.isLocked())
        return res
          .status(423)
          .json({ error: "Account locked. Contact super admin." });

      const isMatch = await admin.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ error: "Invalid credentials" });

      await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

      const token = signToken(admin._id, admin.role);
      res.json({
        message: "Admin login successful",
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          department: admin.department,
          adminId: admin.adminId,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── Get current user ──────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({
    user: {
      ...req.user.toObject(),
      role: req.userType === "student" ? "student" : req.user.role,
    },
  });
});

export default router;
