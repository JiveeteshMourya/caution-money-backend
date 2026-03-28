import * as authService from "../services/auth.service.js";
import ServerResponse from "../utils/ServerResponse.js";

export const registerStudent = async (req, res) => {
  const result = await authService.registerStudent(req.body);
  res.status(201).json(new ServerResponse(201, result));
};

export const loginStudent = async (req, res) => {
  const result = await authService.loginStudent(req.body);
  res.status(200).json(new ServerResponse(200, result));
};

export const loginAdmin = async (req, res) => {
  const result = await authService.loginAdmin(req.body);
  res.status(200).json(new ServerResponse(200, result));
};

export const getMe = async (req, res) => {
  res.status(200).json(
    new ServerResponse(200, {
      user: {
        ...req.user.toObject(),
        role: req.userType === "student" ? "student" : req.user.role,
      },
    })
  );
};
