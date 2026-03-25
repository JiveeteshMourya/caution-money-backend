export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json(data);
};
