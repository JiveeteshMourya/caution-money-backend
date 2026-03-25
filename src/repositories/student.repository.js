import Student from "../models/Student.js";

export const findByEnrollment = (enrollmentNumber) =>
  Student.findOne({ enrollmentNumber: enrollmentNumber.toUpperCase() });

export const findByEnrollmentWithPassword = (enrollmentNumber) =>
  Student.findOne({
    enrollmentNumber: enrollmentNumber.toUpperCase(),
  }).select("+password");

export const findById = (id) => Student.findById(id);

export const create = (data) => Student.create(data);

export const updateById = (id, updates) =>
  Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

export const updateLoginSuccess = (id) =>
  Student.findByIdAndUpdate(id, {
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
