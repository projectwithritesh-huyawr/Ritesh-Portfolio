export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found.' });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must be valid JSON.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large.' });
  }

  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = status < 500 ? error.message : 'Something went wrong.';
    if (status >= 500) console.error(`Unhandled API error: ${error.name || 'Error'}`);

  return res.status(status).json({ success: false, message });
};
