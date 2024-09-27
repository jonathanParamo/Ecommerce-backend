// Import required dependencies
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Import custom routes and database connection
import { connect } from './db_Mongoose.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

app.use(cookieParser());

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

const allowedOrigins = [
  process.env.ALLOWED_ORIGINS_ONE,
  process.env.ALLOWED_ORIGINS_TWO,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: "GET,POST,PATCH,DELETE",
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
};

app.use(cors(corsOptions));

app.use(morgan('dev'));

const apiBase = '/api/v1';

app.get('/', (req, res) => {
  res.send(`🌟 Welcome to the Shop API! ✨ Your gateway to a seamless shopping experience.
  Where every request is handled with precision, and every product crafted with love. 💫 Happy Shopping! 🛍️`);
});

app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/users`, userRoutes);
app.use(`${apiBase}/products`, productRoutes);
app.use(`${apiBase}/categories`, categoryRoutes);
app.use(`${apiBase}/orders`, orderRoutes);

connect().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
