import * as adminService from "../services/admin.service.js";
import ServerResponse from "../utils/ServerResponse.js";

export const getProfile = (req, res) => {
  res
    .status(200)
    .json(new ServerResponse(200, adminService.getProfile(req.user)));
};

export const getAllAdmins = async (_req, res) => {
  const result = await adminService.getAllAdmins();
  res.status(200).json(new ServerResponse(200, result));
};
