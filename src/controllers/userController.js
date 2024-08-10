import User from '../models/userModel.js';

// get users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user.
export const createUser = async (req, res) => {
  const { name, email } = req.body;

  const user = new User({
    name: name,
    email: email,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
