export const validateBoat = (req, res, next) => {
  const { name, type, year } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required and must be a non-empty string" });
  }

  if (!type || typeof type !== 'string' || type.trim().length === 0) {
    return res.status(400).json({ error: "Type is required and must be a non-empty string" });
  }

  if (!year || !Number.isInteger(Number(year)) || Number(year) < 1800 || Number(year) > new Date().getFullYear() + 10) {
    return res.status(400).json({ error: "Year is required and must be a valid year" });
  }

  next();
};

export const validateBoatUpdate = (req, res, next) => {
  const { name, type, year } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }

  if (type !== undefined && (typeof type !== 'string' || type.trim().length === 0)) {
    return res.status(400).json({ error: "Type must be a non-empty string" });
  }

  if (year !== undefined && (!Number.isInteger(Number(year)) || Number(year) < 1800 || Number(year) > new Date().getFullYear() + 10)) {
    return res.status(400).json({ error: "Year must be a valid year" });
  }

  next();
};