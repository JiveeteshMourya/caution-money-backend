import * as studentRepo from "../repositories/student.repository.js";
import ServerError from "../errors/ServerError.js";

export const getProfile = async (studentId) => {
  const student = await studentRepo.findById(studentId);
  if (!student) throw new ServerError(404, "Student not found");
  return { student };
};

export const updateProfile = async (studentId, body) => {
  const allowed = ["mobileNumber", "bankDetails", "passoutYear"];
  const updates = {};
  allowed.forEach((f) => {
    if (body[f] !== undefined) updates[f] = body[f];
  });
  const student = await studentRepo.updateById(studentId, updates);
  return { message: "Profile updated", student };
};
