import Joi from "joi";

export const googleLogin = Joi.object({
  idToken: Joi.string().required().messages({
    "any.required": "ID token is required",
    "string.empty": "ID token cannot be empty",
  }),
  role: Joi.string().valid("STUDENT", "RECRUITER").optional(),
});

export default {
  googleLogin,
};
