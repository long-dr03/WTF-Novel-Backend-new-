import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../variables/jwt'

export interface AuthRequest extends Request {
    user?: any;
    userId?: string;
}

/**
 * Middleware xác thực người dùng qua JWT Token (Bearer Token)
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
    }

    try {
        const decoded = verifyToken(token);

        req.userId = decoded.userId as string;
        req.user = { _id: decoded.userId };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};