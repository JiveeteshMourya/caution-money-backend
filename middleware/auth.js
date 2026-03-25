import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res.status(401).json({ error: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "student") {
      req.user = await Student.findById(decoded.id).select("-password");
      req.userType = "student";
    } else {
      req.user = await Admin.findById(decoded.id).select("-password");
      req.userType = "admin";
    }
    if (!req.user) return res.status(401).json({ error: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalid or expired" });
  }
};

export const protectAdmin = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.userType !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
};

export const protectStudent = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.userType !== "student") {
      return res.status(403).json({ error: "Student access required" });
    }
    next();
  });
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: `Role '${req.user.role}' is not allowed here` });
    }
    next();
  };
};

export const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
