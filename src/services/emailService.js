
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/userModel.js';

const generatePasswordResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

export const sendPasswordResetEmail = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    throw new Error('No user found with this email');
  }

  const resetToken = generatePasswordResetToken();

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 3600000;
  await user.save();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.MAIL_USER,
    to: userEmail,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the following link to reset your password: \n\n` +
          `http://localhost:4000/shop/users/reset-password/${resetToken}`+ '\n\n' +
          `If you did not request this, please ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
