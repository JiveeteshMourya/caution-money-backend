import mongoose from "mongoose";

const clearanceSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "cleared", "hold", "na"],
    default: "pending",
  },
  reason: { type: String, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  updatedByName: { type: String },
  updatedAt: { type: Date },
  remarks: { type: String, default: "" },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      default: () => "IEHE-" + Date.now().toString(36).toUpperCase(),
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    enrollmentNumber: { type: String, required: true, uppercase: true },
    studentName: { type: String, required: true },
    department: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    isHosteller: { type: Boolean, default: false },
    passoutYear: { type: Number, required: true },

    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      branchName: { type: String },
    },

    clearances: {
      library: { type: clearanceSchema, default: () => ({}) },
      sports: { type: clearanceSchema, default: () => ({}) },
      hostel: { type: clearanceSchema, default: () => ({ status: "na" }) },
      department: { type: clearanceSchema, default: () => ({}) },
      accounts: { type: clearanceSchema, default: () => ({}) },
    },

    overallStatus: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "partially_cleared",
        "fully_cleared",
        "refund_processed",
        "rejected",
        "on_hold",
      ],
      default: "submitted",
    },

    refundAmount: { type: Number, default: 5000 },
    refundStatus: {
      type: String,
      enum: ["pending", "approved", "processed", "rejected"],
      default: "pending",
    },
    refundProcessedAt: { type: Date },
    refundTransactionId: { type: String },

    declaration: { type: Boolean, required: true, default: false },
    submittedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },

    timeline: [
      {
        event: String,
        description: String,
        performedBy: String,
        role: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compute overall status before save
applicationSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  const c = this.clearances;
  const required = ["library", "sports", "department", "accounts"];
  if (this.isHosteller) required.push("hostel");

  const statuses = required.map((k) => c[k]?.status);
  if (statuses.some((s) => s === "hold")) {
    this.overallStatus = "on_hold";
  } else if (statuses.every((s) => s === "cleared")) {
    this.overallStatus =
      this.refundStatus === "processed" ? "refund_processed" : "fully_cleared";
  } else if (statuses.some((s) => s === "cleared")) {
    this.overallStatus = "partially_cleared";
  } else {
    this.overallStatus = "under_review";
  }
  next();
});

export default mongoose.model("Application", applicationSchema);
