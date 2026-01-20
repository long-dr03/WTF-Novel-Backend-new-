import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import User from '../models/User';

/**
 * Middleware kiểm tra quyền Admin
 * Yêu cầu: Phải dùng sau middleware `protect`
 */
export const admin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng.' });
        }

        const user = await User.findById(req.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập vào tài nguyên này.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};
