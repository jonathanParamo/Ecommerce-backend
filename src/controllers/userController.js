import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { name, surname, cedula, email, password } = req.body;

    // Email regex pattern to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if the name and surname are provided
    if (!name || !surname) {
      return res.status(400).json({ message: 'Name and surname are required' });
    }

    // Check if the cedula is already registered with another user
    const existingUserWithCedula = await User.findOne({ cedula: cedula });
    if (existingUserWithCedula) {
      return res.status(400).json({ message: 'Cedula is already registered with another account.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      cedula,
    });

    const newUser = await user.save();

    // Create a JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Remove the password from the user object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send the response
    res.status(201).json({ user: userResponse, token });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update user.
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, cedula } = req.body;

  try {
    // Check if the cedula is already registered with another user
    const existingUserWithCedula = await User.findOne({ cedula: cedula, _id: { $ne: id } });

    if (existingUserWithCedula) {
      return res.status(400).json({ message: 'Cedula is already registered with another account.' });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { name, email, cedula }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
