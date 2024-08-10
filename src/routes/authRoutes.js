import express from 'express';
const router = express.Router();

// Routes:
router.get('/', (req, res) => {
  res.send('Hello from the Shop API! 🌟 Where data magic happens. Crafted with care by .');
});

export default router;
