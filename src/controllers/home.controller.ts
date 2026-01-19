import { Request, Response } from 'express';

/**
 * Trang chủ API - Trả về thông báo chào mừng
 */
export const index = (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Novel Backend API' });
};

/**
 * Endpoint kiểm tra kết nối (Test)
 */
export const test = (req: Request, res: Response) => {
    res.send('hello world');
};

/**
 * Endpoint kiểm tra kết nối khác (Test 1)
 */
export const test1 = (req: Request, res: Response) => {
    res.send('hello world');
};
