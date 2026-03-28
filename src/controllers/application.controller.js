import * as appService from "../services/application.service.js";
import ServerResponse from "../utils/ServerResponse.js";

export const submitApplication = async (req, res) => {
  const result = await appService.submitApplication(req.user, req.body);
  res.status(201).json(new ServerResponse(201, result));
};

export const getMyApplication = async (req, res) => {
  const result = await appService.getMyApplication(req.user._id);
  res.status(200).json(new ServerResponse(200, result));
};

export const updateBankDetails = async (req, res) => {
  const result = await appService.updateBankDetails(req.user._id, req.body);
  res.status(200).json(new ServerResponse(200, result));
};

export const getAllApplications = async (req, res) => {
  const result = await appService.getAllApplications(req.user, req.query);
  res.status(200).json(new ServerResponse(200, result));
};

export const getApplicationById = async (req, res) => {
  const result = await appService.getApplicationById(req.params.id);
  res.status(200).json(new ServerResponse(200, result));
};

export const updateClearance = async (req, res) => {
  const result = await appService.updateClearance(
    req.params.id,
    req.user,
    req.body
  );
  res.status(200).json(new ServerResponse(200, result));
};

export const processRefund = async (req, res) => {
  const result = await appService.processRefund(req.params.id, req.user);
  res.status(200).json(new ServerResponse(200, result));
};

export const getDashboardStats = async (req, res) => {
  const result = await appService.getDashboardStats(req.user);
  res.status(200).json(new ServerResponse(200, result));
};
