import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';

router.use(cookieParser());

router.get('/', (req, res) => {
  res.send('Hello from the Shop API! 🌟 Where data magic happens. Crafted with care.');
});

router.get('/verify-token', (req, res) => {
  const token = req.cookies.jwt;
  const refreshToken = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  // Verificar el token JWT
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err && err.name === 'TokenExpiredError') {
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
      }

      jwt.verify(refreshToken, REFRESH_SECRET, (err, refreshDecoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generar un nuevo access token
        const newAccessToken = jwt.sign(
          { id: refreshDecoded.id, isAdmin: refreshDecoded.isAdmin },
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        // Enviar el nuevo token de vuelta al cliente en una cookie
        res.cookie('jwt', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
          maxAge: 24 * 60 * 60 * 1000,
          domain: undefined,
        });

        // Responder con éxito y el nuevo token
        return res.json({ valid: true, user: refreshDecoded });
      });
    } else if (err) {
      return res.status(401).json({ valid: false });
    } else {
      // Si el token de acceso es válido, continuar normalmente
      return res.json({ valid: true, user: decoded });
    }
  });
});


// Ruta para solicitar un nuevo access token usando el refresh token
router.post('/login-admin/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  // Verificar el refresh token
  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generar un nuevo access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, isAdmin: decoded.isAdmin },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  });
});

// Ruta para cerrar sesión (eliminar los tokens de las cookies)
router.post('/login-admin/logout', (req, res) => {
  res.clearCookie('jwt');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
