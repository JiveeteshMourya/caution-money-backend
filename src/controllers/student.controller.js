import * as studentService from "../services/student.service.js";
import { sendSuccess } from "../utils/response.js";

export const getProfile = async (req, res, next) => {
  try {
    const result = await studentService.getProfile(req.user._id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await studentService.updateProfile(req.user._id, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
