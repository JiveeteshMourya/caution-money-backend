import * as studentRepo from "../repositories/student.repository.js";
import * as adminRepo from "../repositories/admin.repository.js";
import { signToken } from "../utils/tokenHelper.js";
import { ConflictError, UnauthorizedError } from "../errors/AppError.js";

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
  if (exists) throw new ConflictError("Enrollment number already registered");

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

  if (!student) throw new UnauthorizedError("Invalid credentials");
  if (student.isLocked())
    throw Object.assign(
      new UnauthorizedError(
        "Account locked due to too many failed attempts. Try again in 2 hours."
      ),
      { statusCode: 423 }
    );

  const isMatch = await student.comparePassword(password);
  if (!isMatch) {
    await student.incLoginAttempts();
    throw new UnauthorizedError("Invalid credentials");
  }

  await studentRepo.updateLoginSuccess(student._id);

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

  if (!admin || !admin.isActive)
    throw new UnauthorizedError("Invalid credentials or account inactive");
  if (admin.isLocked && admin.isLocked())
    throw Object.assign(
      new UnauthorizedError("Account locked. Contact super admin."),
      { statusCode: 423 }
    );

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    await adminRepo.incrementLoginAttempts(admin._id);
    throw new UnauthorizedError("Invalid credentials");
  }

  await adminRepo.updateLoginSuccess(admin._id);

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
