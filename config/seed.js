import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// Inline schemas for seeding
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  adminId: String,
  isActive: Boolean,
});
const Admin = mongoose.model("Admin", adminSchema);

const seed = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}`);
  await Admin.deleteMany({});

  const admins = [
    {
      name: "Super Admin",
      email: "superadmin@iehe.ac.in",
      password: await bcrypt.hash("Admin@123", 12),
      role: "superadmin",
      department: "Administration",
      adminId: "SA001",
      isActive: true,
    },
    {
      name: "Library Head",
      email: "library@iehe.ac.in",
      password: await bcrypt.hash("Lib@123", 12),
      role: "library",
      department: "Library",
      adminId: "LIB001",
      isActive: true,
    },
    {
      name: "Sports Officer",
      email: "sports@iehe.ac.in",
      password: await bcrypt.hash("Sports@123", 12),
      role: "sports",
      department: "Sports",
      adminId: "SPO001",
      isActive: true,
    },
    {
      name: "Hostel Warden",
      email: "hostel@iehe.ac.in",
      password: await bcrypt.hash("Hostel@123", 12),
      role: "hostel",
      department: "Hostel",
      adminId: "HOS001",
      isActive: true,
    },
    {
      name: "CSE HOD",
      email: "cse@iehe.ac.in",
      password: await bcrypt.hash("Dept@123", 12),
      role: "department",
      department: "CSE",
      adminId: "CSE001",
      isActive: true,
    },
    {
      name: "IT HOD",
      email: "it@iehe.ac.in",
      password: await bcrypt.hash("Dept@123", 12),
      role: "department",
      department: "IT",
      adminId: "IT001",
      isActive: true,
    },
    {
      name: "Accounts Head",
      email: "accounts@iehe.ac.in",
      password: await bcrypt.hash("Acc@123", 12),
      role: "accounts",
      department: "Accounts",
      adminId: "ACC001",
      isActive: true,
    },
  ];

  await Admin.insertMany(admins);
  console.log("✅ Admin accounts seeded successfully");
  console.log("\n📋 Admin Credentials:");
  console.log("─────────────────────────────────────────");
  console.log("Super Admin : superadmin@iehe.ac.in / Admin@123");
  console.log("Library     : library@iehe.ac.in    / Lib@123");
  console.log("Sports      : sports@iehe.ac.in     / Sports@123");
  console.log("Hostel      : hostel@iehe.ac.in     / Hostel@123");
  console.log("CSE Dept    : cse@iehe.ac.in        / Dept@123");
  console.log("IT Dept     : it@iehe.ac.in         / Dept@123");
  console.log("Accounts    : accounts@iehe.ac.in   / Acc@123");
  console.log("─────────────────────────────────────────");
  await mongoose.disconnect();
};

seed().catch(console.error);
