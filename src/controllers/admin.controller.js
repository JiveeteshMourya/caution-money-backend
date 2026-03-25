import * as adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.js";

export const getProfile = (req, res) => {
  sendSuccess(res, adminService.getProfile(req.user));
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const result = await adminService.getAllAdmins();
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
