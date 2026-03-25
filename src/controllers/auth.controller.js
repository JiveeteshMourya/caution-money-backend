import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const registerStudent = async (req, res, next) => {
  try {
    const result = await authService.registerStudent(req.body);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
};

export const loginStudent = async (req, res, next) => {
  try {
    const result = await authService.loginStudent(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const result = await authService.loginAdmin(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res) => {
  sendSuccess(res, {
    user: {
      ...req.user.toObject(),
      role: req.userType === "student" ? "student" : req.user.role,
    },
  });
};
