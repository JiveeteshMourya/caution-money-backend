import Joi from "joi";
import { joiValidationSchemaText } from "../../responseTexts.js";

const textField = (fieldName, maxLength = 400) =>
  Joi.string()
    .trim()
    .min(1)
    .max(maxLength)
    .required()
    .messages({
      "string.base": joiValidationSchemaText.textField.base(fieldName),
      "string.empty": joiValidationSchemaText.textField.empty(fieldName),
      "string.max": joiValidationSchemaText.textField.max(fieldName, maxLength),
      "any.required": joiValidationSchemaText.textField.required(fieldName),
    });

const optionalTextField = (fieldName, maxLength = 400) =>
  Joi.string()
    .trim()
    .min(1)
    .max(maxLength)
    .optional()
    .messages({
      "string.base": joiValidationSchemaText.optionalTextField.base(fieldName),
      "string.empty":
        joiValidationSchemaText.optionalTextField.empty(fieldName),
      "string.max": joiValidationSchemaText.optionalTextField.max(
        fieldName,
        maxLength
      ),
    });

const email = Joi.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .required()
  .messages({
    "string.pattern.base": joiValidationSchemaText.email.base,
    "string.empty": joiValidationSchemaText.email.empty,
    "any.required": joiValidationSchemaText.email.required,
  });

const password = Joi.string().min(8).required().messages({
  "string.base": joiValidationSchemaText.password.base,
  "string.min": joiValidationSchemaText.password.min,
  "any.required": joiValidationSchemaText.password.required,
});
