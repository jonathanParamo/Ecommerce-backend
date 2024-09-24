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
    const { name, surname, cedula, email, password, role } = req.body;

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
      role: role || 'user'
    });

    const newUser = await user.save();

    // Create a JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? 'dominio-en-vercel.com' : 'http://localhost:5173' || 'http://localhost:3000',
    };

    res.cookie('jwt', token, cookieOptions);

    // Remove the password from the user object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send the response
    res.status(201).json({ user: userResponse });

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

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'No user found with this email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? 'dominio-en-vercel.com' : 'http://localhost:5173' || 'http://localhost:3000',
    }

    res.cookie('jwt', token, cookieOptions);

    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.json({ message: 'loggin successful', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, surname, cedula, email, password, role } = req.body;

    // Verificar que quien solicita la creación es un administrador
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create other admins' });
    }

    // Validar el formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Verificar que se proporcionen el nombre y apellido
    if (!name || !surname) {
      return res.status(400).json({ message: 'Name and surname are required' });
    }

    // Verificar si la cédula ya está registrada
    const existingUserWithCedula = await User.findOne({ cedula });
    if (existingUserWithCedula) {
      return res.status(400).json({ message: 'Cedula is already registered with another account.' });
    }

    // Verificar si el usuario con el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario con rol 'admin'
    const admin = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      cedula,
      role: 'admin'
    });

    const newAdmin = await admin.save();

    // Crear token JWT
    const token = jwt.sign({ id: newAdmin._id, role: newAdmin.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? 'dominio-en-vercel.com' : 'http://localhost:5173' || 'http://localhost:3000',
    };

    res.cookie('jwt', token, cookieOptions);

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    // Enviar la respuesta
    res.status(201).json({ admin: adminResponse });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'No user found with this email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const cookieOptions = {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      // maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? 'dominio-en-vercel.com' : 'http://localhost:5173' || 'http://localhost:3000',
    };

    res.cookie('jwt', token, cookieOptions);

    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.json({ message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
