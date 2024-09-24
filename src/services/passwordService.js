import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Password reset token is invalid or has expired.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};
