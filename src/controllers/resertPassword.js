import { resetPassword } from '../services/passwordService.js';

export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    await resetPassword(token, newPassword);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
