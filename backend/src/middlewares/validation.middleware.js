import ValidationException from "../exceptions/validation.exception.js";

/**
 * Middleware factory to run Joi schema validation on req.body and throw ValidationException on failure.
 * @param {Joi.Schema} schema 
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMap = error.details.reduce((acc, detail) => {
        const path = detail.path.join(".");
        acc[path] = detail.message;
        return acc;
      }, {});

      return next(new ValidationException("Validation failed", errorMap));
    }

    // Assign sanitized & validated properties back to body
    req.body = value;
    next();
  };
};

export default validate;
