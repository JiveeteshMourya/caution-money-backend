import * as adminService from "../services/admin.service.js";
import ServerResponse from "../utils/ServerResponse.js";
import logger from "../utils/logger.js";

export const getProfile = (req, res) => {
  logger.http(`getProfile - GET ${req.originalUrl}`);
  const data = adminService.getProfile(req.user);
  logger.info(`getProfile - fetched admin: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, data));
};

export const getAllAdmins = async (req, res) => {
  logger.http(`getAllAdmins - GET ${req.originalUrl}`);
  const result = await adminService.getAllAdmins();
  logger.info(`getAllAdmins - fetched admins`);
  res.status(200).json(new ServerResponse(200, result));
};
