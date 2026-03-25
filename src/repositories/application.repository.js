import Application from "../models/Application.js";

export const findByStudentId = (studentId) =>
  Application.findOne({ student: studentId });

export const findByApplicationId = (applicationId, populate = false) => {
  const query = Application.findOne({ applicationId });
  if (populate) {
    query.populate(
      "student",
      "name enrollmentNumber mobileNumber department dateOfBirth"
    );
  }
  return query;
};

export const findAll = (query, page, limit) =>
  Application.find(query)
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

export const countDocuments = (query) => Application.countDocuments(query);

export const create = (data) => Application.create(data);
