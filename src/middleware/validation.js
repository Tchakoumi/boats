import { z } from 'zod';

const BoatType = z.enum([
  'Sailboat',
  'Motorboat',
  'Yacht',
  'FishingBoat',
  'Houseboat',
  'Canoe',
  'Kayak',
  'Ferry',
  'Speedboat',
  'Tugboat'
]);

const boatSchema = z.object({
  name: z.string().trim().min(1, "Name is required and must be a non-empty string"),
  type: BoatType,
  year: z.number().int().min(1800, "Year must be at least 1800").max(new Date().getFullYear() + 10, "Year cannot be more than 10 years in the future")
});

const validateBoat = (isUpdate = false) => (req, res, next) => {
  try {
    const schema = isUpdate ? boatSchema.partial() : boatSchema;
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.errors?.[0]?.message || "Validation error"
      });
    }
    return res.status(400).json({ error: "Invalid input" });
  }
};

export { validateBoat };
export const validateBoatUpdate = validateBoat(true);