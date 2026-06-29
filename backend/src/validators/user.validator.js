import Joi from "joi";

export const updateProfile = Joi.object({
  name: Joi.string().max(100).optional().messages({
    "string.empty": "Name cannot be empty",
    "string.max": "Name cannot exceed 100 characters",
  }),
  bio: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Bio cannot exceed 500 characters",
  }),
  university: Joi.string().allow("").optional(),
  department: Joi.string().allow("").optional(),
  graduationYear: Joi.number().integer().min(1990).max(2035).optional().messages({
    "number.min": "Graduation year must be at least 1990",
    "number.max": "Graduation year must be at most 2035",
    "number.base": "Graduation year must be a number",
  }),
});

export default {
  updateProfile,
};
