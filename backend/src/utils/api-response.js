class ApiResponse {
  static success(res, data, message, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data, message) {
    return res.status(201).json({
      success: true,
      message: message || "Resource created successfully",
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static error(res, message, statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;
