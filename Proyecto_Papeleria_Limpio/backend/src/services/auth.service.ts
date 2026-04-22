import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { ApiError } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_para_desarrollo_123';
const JWT_EXPIRES_IN = '8h';

export class AuthService {
  /**
   * Login user and return token + user data
   */
  static async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Credenciales inválidas') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  /**
   * Verify token and return user data
   */
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) return null;

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }
}
