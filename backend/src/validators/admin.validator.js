import Joi from "joi";

export const updateRole = Joi.object({
  role: Joi.string().valid("STUDENT", "RECRUITER").required().messages({
    "any.required": "Role is required",
    "any.only": "Role must be one of: STUDENT, RECRUITER",
  }),
});

export default {
  updateRole,
};
