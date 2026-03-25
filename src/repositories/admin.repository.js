import Admin from "../models/Admin.js";

export const findByEmailWithPassword = (email) =>
  Admin.findOne({ email }).select("+password");

export const findById = (id) => Admin.findById(id);

export const findAll = () => Admin.find().select("-password");

export const updateLoginSuccess = (id) =>
  Admin.findByIdAndUpdate(id, {
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });

export const incrementLoginAttempts = async (id) => {
  const admin = await Admin.findById(id).select("loginAttempts lockUntil");
  if (!admin) return;
  const updates = { $inc: { loginAttempts: 1 } };
  if (admin.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return Admin.findByIdAndUpdate(id, updates);
};
