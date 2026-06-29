import AppException from "./app.exceptions.js";
import { HTTP_STATUS } from "../constants/http-status.js";

class ValidationException extends AppException {
  constructor(message = "Validation failed", errors = null) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
  }
}

export default ValidationException;
