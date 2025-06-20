export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Handle Prisma errors
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Resource already exists" });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  // Default server error
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};