import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { connect } from './db_Mongoose.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();

app.use(helmet());

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT, DELETE",
  // allowedHeaders: 'Content-Type,Authorization',
  // credentials: true
}))

app.use(morgan('dev'));

app.use('/', authRoutes);
app.use('/shop/users', userRoutes);
app.use('/products', productRoutes);

connect().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
