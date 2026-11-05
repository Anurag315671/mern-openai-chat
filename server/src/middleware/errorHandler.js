export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.statusCode || error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : error.message || 'Internal server error.',
  });
}
