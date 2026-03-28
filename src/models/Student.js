import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{8,14}$/, "Invalid enrollment number format"],
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    mobileNumber: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },
    department: {
      type: String,
      required: true,
      enum: ["CS", "PHY", "CHE", "MATH", "BIO-TECH"],
    },
    dateOfBirth: { type: Date, required: true },
    isHosteller: { type: Boolean, default: false },
    password: { type: String, required: true, minlength: 8, select: false },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
    },
    passoutYear: { type: Number },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before save
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
studentSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
studentSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  return this.updateOne(updates);
};

export default mongoose.model("Student", studentSchema);
