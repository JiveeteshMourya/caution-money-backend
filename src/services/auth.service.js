import * as studentRepo from "../repositories/student.repository.js";
import * as adminRepo from "../repositories/admin.repository.js";
import { signToken } from "../utils/tokenHelper.js";
import ServerError from "../errors/ServerError.js";
import logger from "../utils/logger.js";

export const registerStudent = async (body) => {
  const {
    enrollmentNumber,
    name,
    mobileNumber,
    department,
    dateOfBirth,
    password,
    isHosteller,
    passoutYear,
  } = body;

  const exists = await studentRepo.findByEnrollment(enrollmentNumber);
  if (exists) {
    logger.warn(
      `registerStudent - enrollment already exists: ${enrollmentNumber}`
    );
    throw new ServerError(409, "Enrollment number already registered");
  }

  const student = await studentRepo.create({
    enrollmentNumber: enrollmentNumber.toUpperCase(),
    name,
    mobileNumber,
    department,
    dateOfBirth,
    password,
    isHosteller: isHosteller || false,
    passoutYear,
  });

  logger.info(`registerStudent - created student: ${student._id}`);
  const token = signToken(student._id, "student");
  return {
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
  };
};

export const loginStudent = async ({ enrollmentNumber, password }) => {
  const student =
    await studentRepo.findByEnrollmentWithPassword(enrollmentNumber);

  if (!student) {
    logger.warn(
      `loginStudent - no student found with enrollment: ${enrollmentNumber}`
    );
    throw new ServerError(401, "Invalid credentials");
  }
  if (student.isLocked()) {
    logger.warn(`loginStudent - account locked: ${enrollmentNumber}`);
    throw new ServerError(
      423,
      "Account locked due to too many failed attempts. Try again in 2 hours."
    );
  }

  const isMatch = await student.comparePassword(password);
  if (!isMatch) {
    logger.warn(
      `loginStudent - invalid credentials for student: ${student._id}`
    );
    await studentRepo.incLoginAttempts(student);
    throw new ServerError(401, "Invalid credentials");
  }

  await studentRepo.updateLoginSuccess(student._id);
  logger.info(`loginStudent - login success: ${student._id}`);

  const token = signToken(student._id, "student");
  return {
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
  };
};

export const loginAdmin = async ({ email, password }) => {
  const admin = await adminRepo.findByEmailWithPassword(email);

  if (!admin || !admin.isActive) {
    logger.warn(`loginAdmin - no admin found or inactive: ${email}`);
    throw new ServerError(401, "Invalid credentials or account inactive");
  }
  if (admin.isLocked()) {
    logger.warn(`loginAdmin - account locked: ${email}`);
    throw new ServerError(423, "Account locked. Contact super admin.");
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    logger.warn(`loginAdmin - invalid credentials for admin: ${admin._id}`);
    await adminRepo.incrementLoginAttempts(admin._id);
    throw new ServerError(401, "Invalid credentials");
  }

  await adminRepo.updateLoginSuccess(admin._id);
  logger.info(`loginAdmin - login success: ${admin._id}`);

  const token = signToken(admin._id, admin.role);
  return {
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
  };
};
