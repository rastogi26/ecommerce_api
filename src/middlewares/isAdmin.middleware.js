
const isAdmin = (req, res, next) => {
  // Assuming you have stored user information in req.user after authentication
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Access forbidden. Only admins are allowed." });
  }
  next(); // If user is admin, proceed to the next middleware or route handler
};

export default isAdmin;
