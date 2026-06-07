const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = "Server Error") => {
  return res.status(statusCode).json({ success: false, message });
};

const paginatedResponse = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
