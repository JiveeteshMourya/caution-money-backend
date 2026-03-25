import * as adminRepo from "../repositories/admin.repository.js";

export const getProfile = (admin) => ({ admin });

export const getAllAdmins = async () => {
  const admins = await adminRepo.findAll();
  return { admins };
};
