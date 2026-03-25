import * as appRepo from "../repositories/application.repository.js";
import { CLEARANCE_ROLE_MAP } from "../constants/departments.js";
import { APPLICATION_STATUS } from "../constants/statuses.js";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../errors/AppError.js";

export const submitApplication = async (student, body) => {
  const { bankDetails, passoutYear, declaration } = body;

  const existing = await appRepo.findByStudentId(student._id);
  if (existing)
    throw Object.assign(new ConflictError("Application already submitted"), {
      applicationId: existing.applicationId,
    });

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
        description: "Caution money refund application submitted by student.",
        performedBy: student.name,
        role: "student",
      },
    ],
  };

  const app = await appRepo.create(appData);
  return {
    message: "Application submitted successfully",
    applicationId: app.applicationId,
    application: app,
  };
};

export const getMyApplication = async (studentId) => {
  const app = await appRepo.findByStudentId(studentId);
  if (!app) throw new NotFoundError("No application found");
  return { application: app };
};

export const updateBankDetails = async (studentId, updates) => {
  const app = await appRepo.findByStudentId(studentId);
  if (!app) throw new NotFoundError("Application not found");
  if (app.refundStatus === "processed")
    throw new ValidationError("Refund already processed");
  Object.assign(app.bankDetails, updates);
  await app.save();
  return { message: "Bank details updated", bankDetails: app.bankDetails };
};

export const getAllApplications = async (admin, queryParams) => {
  const { status, department, page = 1, limit = 20, search } = queryParams;
  const query = {};
  if (status) query.overallStatus = status;
  if (department) query.department = department;
  if (search)
    query.$or = [
      { enrollmentNumber: { $regex: search, $options: "i" } },
      { studentName: { $regex: search, $options: "i" } },
    ];

  if (admin.role === "department") query.department = admin.department;

  const total = await appRepo.countDocuments(query);
  const apps = await appRepo.findAll(query, page, limit);

  return {
    applications: apps,
    total,
    pages: Math.ceil(total / limit),
    current: Number(page),
  };
};

export const getApplicationById = async (applicationId) => {
  const app = await appRepo.findByApplicationId(applicationId, true);
  if (!app) throw new NotFoundError("Application not found");
  return { application: app };
};

export const updateClearance = async (applicationId, admin, body) => {
  const { clearanceType, status, reason, remarks } = body;

  if (!CLEARANCE_ROLE_MAP[clearanceType]?.includes(admin.role)) {
    throw new ForbiddenError(
      `You don't have permission to update ${clearanceType} clearance`
    );
  }

  const app = await appRepo.findByApplicationId(applicationId);
  if (!app) throw new NotFoundError("Application not found");
  if (app.clearances[clearanceType].status === "na") {
    throw new ValidationError(
      "This clearance is not applicable for this student"
    );
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
    description: reason || `${clearanceType} clearance updated to ${status}`,
    performedBy: admin.name,
    role: admin.role,
  });

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
  return { message: "Clearance updated successfully", application: app };
};

export const processRefund = async (applicationId, admin) => {
  const app = await appRepo.findByApplicationId(applicationId);
  if (!app) throw new NotFoundError("Application not found");
  if (app.overallStatus !== APPLICATION_STATUS.FULLY_CLEARED)
    throw new ValidationError("All clearances must be approved first");

  const txnId = "IEHE-TXN-" + Date.now().toString(36).toUpperCase();
  app.refundStatus = "processed";
  app.refundProcessedAt = new Date();
  app.refundTransactionId = txnId;
  app.overallStatus = APPLICATION_STATUS.REFUND_PROCESSED;
  app.clearances.accounts.status = "cleared";
  app.timeline.push({
    event: "Refund Processed",
    description: `₹5,000 refund processed. Transaction ID: ${txnId}`,
    performedBy: admin.name,
    role: admin.role,
  });

  await app.save();
  return {
    message: "Refund processed successfully",
    transactionId: txnId,
    application: app,
  };
};

export const getDashboardStats = async (admin) => {
  const baseQuery =
    admin.role === "department" ? { department: admin.department } : {};

  const [total, submitted, underReview, cleared, refunded, onHold] =
    await Promise.all([
      appRepo.countDocuments(baseQuery),
      appRepo.countDocuments({
        ...baseQuery,
        overallStatus: APPLICATION_STATUS.SUBMITTED,
      }),
      appRepo.countDocuments({
        ...baseQuery,
        overallStatus: {
          $in: [
            APPLICATION_STATUS.UNDER_REVIEW,
            APPLICATION_STATUS.PARTIALLY_CLEARED,
          ],
        },
      }),
      appRepo.countDocuments({
        ...baseQuery,
        overallStatus: APPLICATION_STATUS.FULLY_CLEARED,
      }),
      appRepo.countDocuments({
        ...baseQuery,
        overallStatus: APPLICATION_STATUS.REFUND_PROCESSED,
      }),
      appRepo.countDocuments({
        ...baseQuery,
        overallStatus: APPLICATION_STATUS.ON_HOLD,
      }),
    ]);

  const recentApps = await appRepo.findAll(baseQuery, 1, 5);

  return {
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
  };
};
