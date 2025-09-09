export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin" && !req.user.isApproved)
    return res.status(403).json({ message: "Approved Admin access only" });
  next();
};
