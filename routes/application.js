import express from "express";
import { body, validationResult } from "express-validator";
import Application from "../models/Application.js";
import {
  protectStudent,
  protectAdmin,
  restrictTo,
} from "../middleware/auth.js";

const router = express.Router();

// ── Student: Submit Application ───────────────────────────────────
router.post(
  "/submit",
  protectStudent,
  [
    body("bankDetails.accountHolderName").trim().notEmpty(),
    body("bankDetails.accountNumber").trim().isLength({ min: 9, max: 18 }),
    body("bankDetails.ifscCode").matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i),
    body("bankDetails.bankName").trim().notEmpty(),
    body("passoutYear").isInt({ min: 2000, max: 2030 }),
    body("declaration").isBoolean().equals("true"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const student = req.user;
      const existing = await Application.findOne({ student: student._id });
      if (existing)
        return res
          .status(409)
          .json({
            error: "Application already submitted",
            applicationId: existing.applicationId,
          });

      const { bankDetails, passoutYear, declaration } = req.body;
      const appData = {
        student: student._id,
        enrollmentNumber: student.enrollmentNumber,
        studentName: student.name,
        department: student.department,
        mobileNumber: student.mobileNumber,
        isHosteller: student.isHosteller,
        passoutYear,
        bankDetails,
        declaration,
        clearances: {
          library: { status: "pending" },
          sports: { status: "pending" },
          hostel: { status: student.isHosteller ? "pending" : "na" },
          department: { status: "pending" },
          accounts: { status: "pending" },
        },
        timeline: [
          {
            event: "Application Submitted",
            description:
              "Caution money refund application submitted by student.",
            performedBy: student.name,
            role: "student",
          },
        ],
      };

      const app = await Application.create(appData);
      res
        .status(201)
        .json({
          message: "Application submitted successfully",
          applicationId: app.applicationId,
          application: app,
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ── Student: Get Own Application ──────────────────────────────────
router.get("/my", protectStudent, async (req, res) => {
  try {
    const app = await Application.findOne({ student: req.user._id });
    if (!app) return res.status(404).json({ error: "No application found" });
    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Student: Update Bank Details ──────────────────────────────────
router.patch("/bank-details", protectStudent, async (req, res) => {
  try {
    const app = await Application.findOne({ student: req.user._id });
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (app.refundStatus === "processed")
      return res.status(400).json({ error: "Refund already processed" });
    app.bankDetails = { ...app.bankDetails, ...req.body };
    await app.save();
    res.json({ message: "Bank details updated", bankDetails: app.bankDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Get All Applications ───────────────────────────────────
router.get("/all", protectAdmin, async (req, res) => {
  try {
    const { status, department, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.overallStatus = status;
    if (department) query.department = department;
    if (search)
      query.$or = [
        { enrollmentNumber: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
      ];

    // Role-based filtering
    const admin = req.user;
    if (admin.role === "department") query.department = admin.department;

    const total = await Application.countDocuments(query);
    const apps = await Application.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      applications: apps,
      total,
      pages: Math.ceil(total / limit),
      current: Number(page),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Get Single Application ─────────────────────────────────
router.get("/:id", protectAdmin, async (req, res) => {
  try {
    const app = await Application.findOne({
      applicationId: req.params.id,
    }).populate(
      "student",
      "name enrollmentNumber mobileNumber department dateOfBirth"
    );
    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Update Clearance ───────────────────────────────────────
router.patch(
  "/:id/clearance",
  protectAdmin,
  [
    body("clearanceType").isIn([
      "library",
      "sports",
      "hostel",
      "department",
      "accounts",
    ]),
    body("status").isIn(["cleared", "hold", "pending"]),
    body("reason").optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { clearanceType, status, reason, remarks } = req.body;
      const admin = req.user;

      // Role-permission check
      const roleMap = {
        library: ["library", "superadmin"],
        sports: ["sports", "superadmin"],
        hostel: ["hostel", "superadmin"],
        department: ["department", "superadmin"],
        accounts: ["accounts", "superadmin"],
      };
      if (!roleMap[clearanceType]?.includes(admin.role)) {
        return res
          .status(403)
          .json({
            error: `You don't have permission to update ${clearanceType} clearance`,
          });
      }

      const app = await Application.findOne({ applicationId: req.params.id });
      if (!app) return res.status(404).json({ error: "Application not found" });
      if (app.clearances[clearanceType].status === "na") {
        return res
          .status(400)
          .json({ error: "This clearance is not applicable for this student" });
      }

      app.clearances[clearanceType] = {
        status,
        reason: reason || "",
        remarks: remarks || "",
        updatedBy: admin._id,
        updatedByName: admin.name,
        updatedAt: new Date(),
      };

      app.timeline.push({
        event: `${clearanceType.charAt(0).toUpperCase() + clearanceType.slice(1)} Clearance ${status === "cleared" ? "Approved" : status === "hold" ? "Put on Hold" : "Pending"}`,
        description:
          reason || `${clearanceType} clearance updated to ${status}`,
        performedBy: admin.name,
        role: admin.role,
      });

      // Auto-approve accounts if all others are cleared
      const required = ["library", "sports", "department"];
      if (app.isHosteller) required.push("hostel");
      const allDeptCleared = required.every(
        (k) => app.clearances[k].status === "cleared"
      );
      if (allDeptCleared && clearanceType !== "accounts") {
        app.timeline.push({
          event: "Forwarded to Accounts",
          description:
            "All department clearances obtained. Application forwarded to Accounts Section.",
          performedBy: "System",
          role: "system",
        });
      }

      await app.save();
      res.json({ message: "Clearance updated successfully", application: app });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── Admin: Process Refund (Accounts only) ─────────────────────────
router.patch(
  "/:id/refund",
  protectAdmin,
  restrictTo("accounts", "superadmin"),
  async (req, res) => {
    try {
      const app = await Application.findOne({ applicationId: req.params.id });
      if (!app) return res.status(404).json({ error: "Application not found" });
      if (app.overallStatus !== "fully_cleared")
        return res
          .status(400)
          .json({ error: "All clearances must be approved first" });

      const txnId = "IEHE-TXN-" + Date.now().toString(36).toUpperCase();
      app.refundStatus = "processed";
      app.refundProcessedAt = new Date();
      app.refundTransactionId = txnId;
      app.overallStatus = "refund_processed";
      app.clearances.accounts.status = "cleared";
      app.timeline.push({
        event: "Refund Processed",
        description: `₹5,000 refund processed. Transaction ID: ${txnId}`,
        performedBy: req.user.name,
        role: "accounts",
      });

      await app.save();
      res.json({
        message: "Refund processed successfully",
        transactionId: txnId,
        application: app,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── Admin: Dashboard Stats ────────────────────────────────────────
router.get("/stats/dashboard", protectAdmin, async (req, res) => {
  try {
    const admin = req.user;
    const baseQuery =
      admin.role === "department" ? { department: admin.department } : {};

    const [total, submitted, underReview, cleared, refunded, onHold] =
      await Promise.all([
        Application.countDocuments(baseQuery),
        Application.countDocuments({
          ...baseQuery,
          overallStatus: "submitted",
        }),
        Application.countDocuments({
          ...baseQuery,
          overallStatus: { $in: ["under_review", "partially_cleared"] },
        }),
        Application.countDocuments({
          ...baseQuery,
          overallStatus: "fully_cleared",
        }),
        Application.countDocuments({
          ...baseQuery,
          overallStatus: "refund_processed",
        }),
        Application.countDocuments({ ...baseQuery, overallStatus: "on_hold" }),
      ]);

    const recentApps = await Application.find(baseQuery)
      .sort({ submittedAt: -1 })
      .limit(5);

    res.json({
      stats: {
        total,
        submitted,
        underReview,
        cleared,
        refunded,
        onHold,
        totalRefundAmount: refunded * 5000,
      },
      recentApplications: recentApps,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
