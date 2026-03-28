import * as studentService from "../services/student.service.js";
import ServerResponse from "../utils/ServerResponse.js";
import logger from "../utils/logger.js";

export const getProfile = async (req, res) => {
  logger.http(`getProfile - GET ${req.originalUrl}`);
  const result = await studentService.getProfile(req.user._id);
  logger.info(`getProfile - fetched: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const updateProfile = async (req, res) => {
  logger.http(
    `updateProfile - PATCH ${req.originalUrl} payload=${JSON.stringify(Object.keys(req.body))}`
  );
  const result = await studentService.updateProfile(req.user._id, req.body);
  logger.info(`updateProfile - updated: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, result));
};
