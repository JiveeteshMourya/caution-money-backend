import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const registerStudent = async (req, res) => {
  const result = await authService.registerStudent(req.body);
  sendSuccess(res, result, 201);
};

export const loginStudent = async (req, res) => {
  const result = await authService.loginStudent(req.body);
  sendSuccess(res, result);
};

export const loginAdmin = async (req, res) => {
  const result = await authService.loginAdmin(req.body);
  sendSuccess(res, result);
};

export const getMe = async (req, res) => {
  sendSuccess(res, {
    user: {
      ...req.user.toObject(),
      role: req.userType === "student" ? "student" : req.user.role,
    },
  });
};
