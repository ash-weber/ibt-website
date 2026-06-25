export const successResponse = (data: any, message = "Success", meta?: any) => ({
  success: true,
  message,
  data,
  ...(meta !== undefined ? { meta } : {}),
});

export const errorResponse = (message = "Error", errors?: any) => ({
  success: false,
  message,
  errors,
});