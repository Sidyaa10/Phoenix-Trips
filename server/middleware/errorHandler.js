function notFound(req, res) {
  res.status(404).json({ message: "Route not found." });
}

function errorHandler(err, req, res, next) {
  const code = err.statusCode || 500;
  res.status(code).json({
    message: err.message || "Server error",
  });
}

module.exports = { notFound, errorHandler };

