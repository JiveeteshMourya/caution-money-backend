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

export const incLoginAttempts = async (student) => {
  if (student.lockUntil && student.lockUntil < Date.now()) {
    return Student.updateOne(
      { _id: student._id },
      { $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } }
    );
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (student.loginAttempts + 1 >= 5 && !student.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return Student.updateOne({ _id: student._id }, updates);
};
