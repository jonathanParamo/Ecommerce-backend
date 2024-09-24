import { sendPasswordResetEmail } from '../services/emailService.js';

// Request password reset
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    await sendPasswordResetEmail(email);
    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending password reset email.', error: error.message });
  }
};
