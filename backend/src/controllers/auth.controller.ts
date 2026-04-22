import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../validators/auth.validator';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData.email, validatedData.password);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - user is added by authMiddleware
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}
