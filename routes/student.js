// routes/student.js
import express from "express";
import Student from "../models/Student.js";
import { protectStudent } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    res.json({ student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/profile", protectStudent, async (req, res) => {
  try {
    const allowed = ["mobileNumber", "bankDetails", "passoutYear"];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const student = await Student.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ message: "Profile updated", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
