// routes/admin.js
import express from "express";
import Admin from "../models/Admin.js";
import { protectAdmin, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", protectAdmin, (req, res) => {
  res.json({ admin: req.user });
});

router.get("/all", protectAdmin, restrictTo("superadmin"), async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
