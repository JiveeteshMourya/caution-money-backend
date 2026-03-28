import * as appService from "../services/application.service.js";
import { sendSuccess } from "../utils/response.js";

export const submitApplication = async (req, res) => {
  const result = await appService.submitApplication(req.user, req.body);
  sendSuccess(res, result, 201);
};

export const getMyApplication = async (req, res) => {
  const result = await appService.getMyApplication(req.user._id);
  sendSuccess(res, result);
};

export const updateBankDetails = async (req, res) => {
  const result = await appService.updateBankDetails(req.user._id, req.body);
  sendSuccess(res, result);
};

export const getAllApplications = async (req, res) => {
  const result = await appService.getAllApplications(req.user, req.query);
  sendSuccess(res, result);
};

export const getApplicationById = async (req, res) => {
  const result = await appService.getApplicationById(req.params.id);
  sendSuccess(res, result);
};

export const updateClearance = async (req, res) => {
  const result = await appService.updateClearance(
    req.params.id,
    req.user,
    req.body
  );
  sendSuccess(res, result);
};

export const processRefund = async (req, res) => {
  const result = await appService.processRefund(req.params.id, req.user);
  sendSuccess(res, result);
};

export const getDashboardStats = async (req, res) => {
  const result = await appService.getDashboardStats(req.user);
  sendSuccess(res, result);
};
