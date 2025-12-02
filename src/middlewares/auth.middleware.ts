// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../variables/jwt'

// Mở rộng Request object để lưu thông tin người dùng
// (Cần phải khai báo lại Request interface nếu bạn sử dụng TypeScript nghiêm ngặt)
// Dành cho ví dụ, ta sẽ sử dụng 'any' hoặc giả định đã được khai báo.

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token;

    // 1. Kiểm tra Token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Định dạng: Bearer <token>
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // Không có token -> Từ chối truy cập
        return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
    }

    try {
        // 2. Xác minh Token
        const decoded = verifyToken(token);

        // 3. Lưu thông tin người dùng vào request để sử dụng ở Controller
        // req.user = await User.findById(decoded.userId); // Bạn có thể tìm user trong DB
        (req as any).userId = decoded.userId; // Hoặc chỉ lưu userId

        next(); // Chuyển qua Controller
    } catch (err) {
        // Token không hợp lệ/hết hạn
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};