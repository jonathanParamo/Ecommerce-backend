import jwt from 'jsonwebtoken';

// Middleware para autenticar y verificar el JWT
export const authenticate = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware para verificar si el usuario es administrador
export const adminMiddleware = (req, res, next) => {

  // Obtener el token de la cookie
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar si el usuario es admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};