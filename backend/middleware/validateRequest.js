import { ZodError } from "zod";

export const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body); // validate & sanitize
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // error.errors is an array of issues
      const errors = error.errors?.map((err) => err.message) || [];
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // fallback for other unexpected errors
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
