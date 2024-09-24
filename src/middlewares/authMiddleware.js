import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to authenticate user based on JWT token stored in cookies
export const authMiddleware = async (req, res, next) => {
  let token;

  // Check if JWT token is available in cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt
  }

  // If token is found, verify it
  if (token) {
    try {
      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token and exclude the password from the result
      req.user = await User.findById(decoded.id).select('-password');

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      // Send an unauthorized error response if token verification fails
      res.status(401).json({ message: 'No autorizado, token no válido' });
    }
  }else {
    // If no token is found, send an unauthorized error response
    res.status(401).json({ message: 'Unauthorized, no token found' });
  }
};
