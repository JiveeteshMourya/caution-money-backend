import * as appService from "../services/application.service.js";
import ServerResponse from "../utils/ServerResponse.js";
import logger from "../utils/logger.js";

export const submitApplication = async (req, res) => {
  logger.http(
    `submitApplication - POST ${req.originalUrl} student=${req.user._id}`
  );
  const result = await appService.submitApplication(req.user, req.body);
  logger.info(`submitApplication - submitted by: ${req.user._id}`);
  res.status(201).json(new ServerResponse(201, result));
};

export const getMyApplication = async (req, res) => {
  logger.http(`getMyApplication - GET ${req.originalUrl}`);
  const result = await appService.getMyApplication(req.user._id);
  logger.info(`getMyApplication - fetched for: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const updateBankDetails = async (req, res) => {
  logger.http(
    `updateBankDetails - PATCH ${req.originalUrl} payload=${JSON.stringify(Object.keys(req.body))}`
  );
  const result = await appService.updateBankDetails(req.user._id, req.body);
  logger.info(`updateBankDetails - updated for: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const getAllApplications = async (req, res) => {
  logger.http(
    `getAllApplications - GET ${req.originalUrl} payload=${JSON.stringify(req.query)}`
  );
  const result = await appService.getAllApplications(req.user, req.query);
  logger.info(`getAllApplications - fetched by admin: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const getApplicationById = async (req, res) => {
  logger.http(
    `getApplicationById - GET ${req.originalUrl} id=${req.params.id}`
  );
  const result = await appService.getApplicationById(req.params.id);
  logger.info(`getApplicationById - fetched: ${req.params.id}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const updateClearance = async (req, res) => {
  logger.http(
    `updateClearance - PATCH ${req.originalUrl} payload=${JSON.stringify({ id: req.params.id, clearanceType: req.body.clearanceType })}`
  );
  const result = await appService.updateClearance(
    req.params.id,
    req.user,
    req.body
  );
  logger.info(
    `updateClearance - updated ${req.body.clearanceType} for: ${req.params.id}`
  );
  res.status(200).json(new ServerResponse(200, result));
};

export const processRefund = async (req, res) => {
  logger.http(`processRefund - PATCH ${req.originalUrl} id=${req.params.id}`);
  const result = await appService.processRefund(req.params.id, req.user);
  logger.info(`processRefund - processed for: ${req.params.id}`);
  res.status(200).json(new ServerResponse(200, result));
};

export const submitOfflineNoDues = async (req, res) => {
  logger.http(
    `submitOfflineNoDues - PATCH ${req.originalUrl} student=${req.user._id}`
  );
  const result = await appService.submitOfflineNoDues(req.user._id, req.file);
  res.status(201).json(new ServerResponse(201, result));
};

export const getDashboardStats = async (req, res) => {
  logger.http(`getDashboardStats - GET ${req.originalUrl}`);
  const result = await appService.getDashboardStats(req.user);
  logger.info(`getDashboardStats - fetched by admin: ${req.user._id}`);
  res.status(200).json(new ServerResponse(200, result));
};
