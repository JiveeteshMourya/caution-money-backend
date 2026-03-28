import * as authService from "../services/auth.service.js";
import ServerResponse from "../utils/ServerResponse.js";
import logger from "../utils/logger.js";

export const registerStudent = async (req, res) => {
  logger.http(
    `registerStudent - POST ${req.originalUrl} payload=${JSON.stringify(req.body.enrollmentNumber)}`
  );
  const result = await authService.registerStudent(req.body);
  logger.info(`registerStudent - registered: ${req.body.enrollmentNumber}`);
  res.status(201).json(new ServerResponse(201, result));
};

export const loginStudent = async (req, res) => {
  logger.http(
    `loginStudent - POST ${req.originalUrl} payload=${JSON.stringify(req.body.enrollmentNumber)}`
  );
  const result = await authService.loginStudent(req.body);
  logger.info(`loginStudent - logged in: ${req.body.enrollmentNumber}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const loginAdmin = async (req, res) => {
  logger.http(
    `loginAdmin - POST ${req.originalUrl} payload=${JSON.stringify(req.body.email)}`
  );
  const result = await authService.loginAdmin(req.body);
  logger.info(`loginAdmin - logged in: ${req.body.email}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const getMe = async (req, res) => {
  logger.http(`getMe - GET ${req.originalUrl}`);
  logger.info(`getMe - fetched user: ${req.user._id}`);
  res.status(200).json(
    new ServerResponse(200, {
      user: {
        ...req.user.toObject(),
        role: req.userType === "student" ? "student" : req.user.role,
      },
    })
  );
};
