import * as studentService from "../services/student.service.js";
import ServerResponse from "../utils/ServerResponse.js";

export const getProfile = async (req, res) => {
  const result = await studentService.getProfile(req.user._id);
  res.status(200).json(new ServerResponse(200, result));
};

export const updateProfile = async (req, res) => {
  const result = await studentService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ServerResponse(200, result));
};
