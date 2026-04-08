import * as appRepo from "../repositories/application.repository.js";
import { CLEARANCE_ROLE_MAP } from "../constants/departments.js";
import { APPLICATION_STATUS } from "../constants/statuses.js";
import ServerError from "../errors/ServerError.js";
import logger from "../utils/logger.js";
import { saveImageToDb } from "../utils/saveImageToDb.js";

export const submitApplication = async (student, body) => {
  const { bankDetails, passoutYear, declaration } = body;

  const existing = await appRepo.findByStudentId(student._id);
  if (existing) {
    logger.warn(
      `submitApplication - already submitted by student: ${student._id}`
    );
    throw new ServerError(409, "Application already submitted", [
      { applicationId: existing.applicationId },
    ]);
  }

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
  logger.info(`submitApplication - created: ${app.applicationId}`);
  return {
    message: "Application submitted successfully",
    applicationId: app.applicationId,
    application: app,
  };
};

export const getMyApplication = async (studentId) => {
  const app = await appRepo.findByStudentId(studentId);
  if (!app) {
    logger.warn(
      `getMyApplication - no application found for student: ${studentId}`
    );
    throw new ServerError(404, "No application found");
  }
  logger.info(`getMyApplication - fetched for: ${studentId}`);
  return { application: app };
};

export const updateBankDetails = async (studentId, updates) => {
  const app = await appRepo.findByStudentId(studentId);
  if (!app) {
    logger.warn(
      `updateBankDetails - application not found for student: ${studentId}`
    );
    throw new ServerError(404, "Application not found");
  }
  if (app.refundStatus === "processed") {
    logger.warn(
      `updateBankDetails - refund already processed for student: ${studentId}`
    );
    throw new ServerError(400, "Refund already processed");
  }
  Object.assign(app.bankDetails, updates);
  await app.save();
  logger.info(`updateBankDetails - updated for: ${studentId}`);
  return { message: "Bank details updated", bankDetails: app.bankDetails };
};

export const getAllApplications = async (admin, queryParams) => {
  const { status, department, page, limit, search } = queryParams;

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

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
  const apps = await appRepo.findAll(query, parsedPage, parsedLimit);

  logger.info(
    `getAllApplications - fetched ${total} total by admin: ${admin._id}`
  );
  return {
    applications: apps,
    total,
    pages: Math.ceil(total / parsedLimit),
    current: parsedPage,
  };
};

export const getApplicationById = async (applicationId) => {
  const app = await appRepo.findByApplicationId(applicationId, true);
  if (!app) {
    logger.warn(`getApplicationById - not found: ${applicationId}`);
    throw new ServerError(404, "Application not found");
  }
  logger.info(`getApplicationById - fetched: ${applicationId}`);
  return { application: app };
};

export const updateClearance = async (applicationId, admin, body) => {
  const { clearanceType, status, reason, remarks } = body;

  if (!CLEARANCE_ROLE_MAP[clearanceType]?.includes(admin.role)) {
    logger.error(
      `updateClearance - forbidden: admin ${admin._id} (role=${admin.role}) attempted ${clearanceType}`
    );
    throw new ServerError(
      403,
      `You don't have permission to update ${clearanceType} clearance`
    );
  }

  const app = await appRepo.findByApplicationId(applicationId);
  if (!app) {
    logger.warn(`updateClearance - application not found: ${applicationId}`);
    throw new ServerError(404, "Application not found");
  }
  if (app.clearances[clearanceType].status === "na") {
    logger.warn(
      `updateClearance - clearance not applicable: ${clearanceType} for ${applicationId}`
    );
    throw new ServerError(
      400,
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
  const alreadyForwarded = app.timeline.some(
    (t) => t.event === "Forwarded to Accounts"
  );
  if (allDeptCleared && clearanceType !== "accounts" && !alreadyForwarded) {
    app.timeline.push({
      event: "Forwarded to Accounts",
      description:
        "All department clearances obtained. Application forwarded to Accounts Section.",
      performedBy: "System",
      role: "system",
    });
  }

  await app.save();
  logger.info(
    `updateClearance - ${clearanceType} updated to ${status} for: ${applicationId}`
  );
  return { message: "Clearance updated successfully", application: app };
};

export const processRefund = async (applicationId, admin) => {
  const app = await appRepo.findByApplicationId(applicationId);
  if (!app) {
    logger.warn(`processRefund - application not found: ${applicationId}`);
    throw new ServerError(404, "Application not found");
  }
  if (app.overallStatus !== APPLICATION_STATUS.FULLY_CLEARED) {
    logger.warn(
      `processRefund - not fully cleared: ${applicationId} status=${app.overallStatus}`
    );
    throw new ServerError(400, "All clearances must be approved first");
  }

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
  logger.info(`processRefund - processed ${txnId} for: ${applicationId}`);
  return {
    message: "Refund processed successfully",
    transactionId: txnId,
    application: app,
  };
};

export const submitOfflineNoDues = async (studentId, clearanceType, file) => {
  const app = await appRepo.findByStudentId(studentId);
  if (!app) {
    logger.warn(
      `submitOfflineNoDues - application not found for student: ${studentId}`
    );
    throw new ServerError(404, "Application not found");
  }
  if (app.refundStatus === "processed") {
    logger.warn(
      `submitOfflineNoDues - refund already processed for student: ${studentId}`
    );
    throw new ServerError(400, "Refund already processed");
  }
  if (!file) {
    logger.warn(
      `submitOfflineNoDues - no file uploaded for student: ${studentId}`
    );
    throw new ServerError(400, "No image uploaded");
  }

  const imageId = await saveImageToDb(
    file.path,
    file.originalname,
    file.mimetype
  );

  app.clearances[clearanceType].noDuesMode = "offline";
  app.clearances[clearanceType].noDuesImageId = imageId;

  app.timeline.push({
    event: "Offline No-Dues Submitted",
    description: `Student submitted offline no-dues image for ${clearanceType} clearance.`,
    performedBy: app.studentName,
    role: "student",
  });

  await app.save();
  logger.info(
    `submitOfflineNoDues - ${clearanceType} offline no-dues saved for student: ${studentId}`
  );
  return {
    message: "Offline no-dues submitted successfully",
    noDuesImageId: imageId,
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

  logger.info(`getDashboardStats - fetched stats for admin: ${admin._id}`);
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
